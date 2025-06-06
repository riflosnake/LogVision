using Dapper;
using LogInfoApi.Dtos;
using LogInfoApi.Options.Log;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Options;
using System.Text;

namespace LogInfoApi.Endpoints;

public static partial class LogsEndpoints
{
    public static Func<LogFilters, IOptions<LogOptions>, IConfiguration, HybridCache, Task<IResult>> GetLogs()
    {
        return async (LogFilters filter, IOptions<LogOptions> logOptionsAccessor, IConfiguration configuration, HybridCache cache) =>
        {
            if (filter == null)
                return Results.BadRequest("Filter is required.");

            var options = logOptionsAccessor.Value;
            var cols = options.Columns;

            var logs = await cache.GetOrCreateAsync(
                key: filter.ToCacheKey(),
                factory: async (ct) =>
                {
                    await using var connection = new SqlConnection(configuration.GetConnectionString("Database"));

                    var sql = new StringBuilder($@"
                    SELECT 
                        CAST({cols.Id} AS VARCHAR) AS Id,
                        {cols.Timestamp} AS Timestamp,
                        ISNULL({cols.Message}, '') AS Message,
                        CASE WHEN {cols.Title} IS NULL OR {cols.Title} = '' THEN 'N/A' ELSE {cols.Title} END AS Type,
                        {cols.Severity} AS Severity,
                        {cols.Machine} AS Machine,
                        ISNULL({cols.StackTrace}, '') AS StackTrace,
                        {cols.ApplicationName} AS ApplicationName,
                        {cols.Source} AS Source,
                        NULL AS Count
                    FROM {options.TableName}
                    WHERE 1 = 1
                ");

                    var parameters = new DynamicParameters();

                    if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                    {
                        sql.AppendLine($"AND {cols.Message} LIKE @SearchTerm");
                        parameters.Add("@SearchTerm", $"%{filter.SearchTerm}%");
                    }

                    if (filter.Severity?.Count > 0)
                    {
                        sql.AppendLine($"AND LOWER({cols.Severity}) IN @Severities");

                        var mapped = filter.Severity
                            .Select(s => s.ToString().ToLower())
                            .Select(s => options.SeverityValues?.TryGetValue(s, out var mappedVal) == true ? mappedVal.ToLower() : s)
                            .ToArray();

                        parameters.Add("@Severities", mapped);
                    }

                    if (DateTime.TryParse(filter.FromDate, out var from))
                    {
                        sql.AppendLine($"AND {cols.Timestamp} >= @FromDate");
                        parameters.Add("@FromDate", from);
                    }

                    if (DateTime.TryParse(filter.ToDate, out var to))
                    {
                        sql.AppendLine($"AND {cols.Timestamp} <= @ToDate");
                        parameters.Add("@ToDate", to);
                    }

                    var skip = Math.Max((filter.Page - 1) * filter.PageSize, 0);
                    var take = Math.Clamp(filter.PageSize, 1, 500);

                    sql.AppendLine($"ORDER BY {cols.Timestamp} DESC OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY");
                    parameters.Add("@Skip", skip);
                    parameters.Add("@Take", take);

                    return (await connection.QueryAsync<LogEntryDto>(sql.ToString(), parameters)).ToList();
                },
                options: null);

            return Results.Ok(logs);
        };
    }
}
