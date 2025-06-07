using Dapper;
using LogInfoApi.Dtos;
using LogInfoApi.Options.Log;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Options;

namespace LogInfoApi.Endpoints;

public static partial class LogsEndpoints
{
    public static async Task<IResult> GetLogTypes(
        ChartFilters filters,
        IOptions<LogOptions> options,
        IConfiguration configuration,
        HybridCache cache)
    {
        if (filters == null)
            return Results.BadRequest("Filter cannot be null.");

        var logOptions = options.Value;

        var tableName = logOptions.TableName;

        var timestampColumn = logOptions.Columns.Timestamp;
        var severityColumn = logOptions.Columns.Severity;
        var titleColumn = logOptions.Columns.Title;

        var result = await cache.GetOrCreateAsync(
            key: $"types-{filters.ToCacheKey()}",
            factory: async (ct) =>
            {
                var sql = $@"
                    SELECT TOP 10
                        CASE WHEN {titleColumn} IS NULL OR {titleColumn} = '' THEN 'N/A' ELSE {titleColumn} END AS Type,
                        {severityColumn} AS Severity,
                        COUNT(*) AS Count
                    FROM {tableName}
                    WHERE 1 = 1
                    ";

                var parameters = new DynamicParameters();

                if (filters.Severity?.Count > 0)
                {
                    sql += $" AND LOWER({severityColumn}) IN @Severities";
                    parameters.Add("@Severities", filters.Severity.Select(s => s.ToLowerInvariant()).ToArray());
                }

                if (filters.TimeRange > 0)
                {
                    var now = DateTime.Now;
                    var cutoff = now.AddMinutes(-filters.TimeRange);

                    sql += $" AND {timestampColumn} >= @Cutoff AND {timestampColumn} <= @Now";
                    parameters.Add("@Cutoff", cutoff);
                    parameters.Add("@Now", now);
                }

                sql += $@"
                    GROUP BY 
                        CASE WHEN {titleColumn} IS NULL OR {titleColumn} = '' THEN 'N/A' ELSE {titleColumn} END,
                        {severityColumn}
                    ORDER BY Count DESC";

                await using var connection = new SqlConnection(configuration.GetConnectionString("Database"));

                return (await connection.QueryAsync<LogTypeCountDto>(sql, parameters)).ToList();
            },
            options: null);

        return Results.Ok(result);
    }
}
