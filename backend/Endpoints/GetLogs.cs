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
    public static async Task<IResult> GetLogs(
        LogFilters filters,
        IOptions<LogOptions> options,
        IConfiguration configuration,
        HybridCache cache)
    {
        if (filters is null)
            return Results.BadRequest("Filter is required.");

        var logOptions = options.Value;
        var columns = logOptions.Columns;

        var logs = await cache.GetOrCreateAsync(
            key: filters.ToCacheKey(),
            factory: async (ct) =>
            {
                var sql = new StringBuilder($@"
                SELECT 
                    CAST({columns.Id} AS VARCHAR) AS Id,
                    {columns.Timestamp} AS Timestamp,
                    ISNULL({columns.Message}, '') AS Message,
                    CASE WHEN {columns.Title} IS NULL OR {columns.Title} = '' THEN 'N/A' ELSE {columns.Title} END AS Type,
                    {columns.Severity} AS Severity,
                    {columns.Machine} AS Machine,
                    ISNULL({columns.StackTrace}, '') AS StackTrace,
                    {columns.ApplicationName} AS ApplicationName,
                    {columns.Source} AS Source,
                    NULL AS Count
                FROM {logOptions.TableName}
                WHERE 1 = 1
            ");

                var parameters = new DynamicParameters();

                if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
                {
                    sql.AppendLine($"AND {columns.Message} LIKE @SearchTerm");
                    parameters.Add("@SearchTerm", $"%{filters.SearchTerm}%");
                }

                if (filters.Severity?.Count > 0)
                {
                    sql.AppendLine($"AND LOWER({columns.Severity}) IN @Severities");

                    var mapped = filters.Severity
                        .Select(s => s.ToString().ToLower())
                        .Select(s => logOptions.SeverityValues?.TryGetValue(s, out var mappedVal) == true ? mappedVal.ToLower() : s)
                        .ToArray();

                    parameters.Add("@Severities", mapped);
                }

                if (DateTime.TryParse(filters.FromDate, out var from))
                {
                    sql.AppendLine($"AND {columns.Timestamp} >= @FromDate");
                    parameters.Add("@FromDate", from);
                }

                if (DateTime.TryParse(filters.ToDate, out var to))
                {
                    sql.AppendLine($"AND {columns.Timestamp} <= @ToDate");
                    parameters.Add("@ToDate", to);
                }

                var skip = Math.Max((filters.Page - 1) * filters.PageSize, 0);
                var take = Math.Clamp(filters.PageSize, 1, 500);

                sql.AppendLine($"ORDER BY {columns.Timestamp} DESC OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY");
                parameters.Add("@Skip", skip);
                parameters.Add("@Take", take);

                await using var connection = new SqlConnection(configuration.GetConnectionString("Database"));
                return (await connection.QueryAsync<LogEntryDto>(sql.ToString(), parameters)).ToList();
            },
            options: null);

        return Results.Ok(logs);
    }
}
