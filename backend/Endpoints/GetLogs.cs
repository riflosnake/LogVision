using Dapper;
using LogInfoApi.Dtos;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Hybrid;
using System.Text;

namespace LogInfoApi.Endpoints;

public static partial class LogsEndpoints
{
    public static Func<LogFilters, IConfiguration, HybridCache, Task<IResult>> GetLogs()
    {
        return async (LogFilters filter, IConfiguration configuration, HybridCache cache) =>
        {
            if (filter == null)
                return Results.BadRequest("Filter is required.");

            var logs = await cache.GetOrCreateAsync(
                key: filter.ToCacheKey(),
                factory: async (ct) =>
                {
                    await using var connection = new SqlConnection(configuration.GetConnectionString("Database"));

                    var sql = new StringBuilder(@"
                    SELECT 
                        CAST(LogId AS VARCHAR) AS Id,
                        Timestamp,
                        ISNULL(Message, '') AS Message,
                        CASE WHEN Title IS NULL OR Title = '' THEN 'N/A' ELSE Title END AS Type,
                        Severity,
                        MachineName AS Machine,
                        ISNULL(FormattedMessage, '') AS StackTrace,
                        AppDomainName AS ApplicationName,
                        ProcessName AS Source,
                        NULL AS Count
                    FROM Log
                    WHERE 1 = 1
                    ");

                    var parameters = new DynamicParameters();

                    if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                    {
                        sql.AppendLine("AND Message LIKE @SearchTerm");
                        parameters.Add("@SearchTerm", $"%{filter.SearchTerm}%");
                    }

                    if (filter.Severity?.Count > 0)
                    {
                        sql.AppendLine("AND LOWER(Severity) IN @Severities");
                        parameters.Add("@Severities", filter.Severity.Select(s => s.ToString().ToLower()).ToArray());
                    }

                    if (DateTime.TryParse(filter.FromDate, out var from))
                    {
                        sql.AppendLine("AND Timestamp >= @FromDate");
                        parameters.Add("@FromDate", from);
                    }

                    if (DateTime.TryParse(filter.ToDate, out var to))
                    {
                        sql.AppendLine("AND Timestamp <= @ToDate");
                        parameters.Add("@ToDate", to);
                    }

                    var skip = Math.Max((filter.Page - 1) * filter.PageSize, 0);
                    var take = Math.Clamp(filter.PageSize, 1, 500);

                    sql.AppendLine("ORDER BY Timestamp DESC OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY");
                    parameters.Add("@Skip", skip);
                    parameters.Add("@Take", take);

                    return (await connection.QueryAsync<LogEntryDto>(sql.ToString(), parameters)).ToList();
                },
                options: null);

            return Results.Ok(logs);
        };
    }
}
