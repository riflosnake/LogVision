using Dapper;
using LogInfoApi.Dtos;
using LogInfoApi.Options.Log;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Options;

namespace LogInfoApi.Endpoints;

public static partial class LogsEndpoints
{
    public static Func<ChartFilters, IConfiguration, HybridCache, IOptions<LogOptions>, Task<IResult>> GetLogTypes()
    {
        return async (ChartFilters filter, IConfiguration configuration, HybridCache cache, IOptions<LogOptions> options) =>
        {
            if (filter == null)
                return Results.BadRequest("Filter cannot be null.");

            var logOptions = options.Value;

            if (logOptions == null)
                return Results.BadRequest("LogSettings configuration section missing.");

            var tableName = logOptions.TableName;
            var tsCol = logOptions.Columns.Timestamp;
            var sevCol = logOptions.Columns.Severity;

            var titleCol = logOptions.Columns.Title;

            var result = await cache.GetOrCreateAsync(
                key: $"types-{filter.ToCacheKey()}",
                factory: async (ct) =>
                {
                    await using var connection = new SqlConnection(configuration.GetConnectionString("Database"));

                    var sql = $@"
                SELECT TOP 10
                    CASE WHEN {titleCol} IS NULL OR {titleCol} = '' THEN 'N/A' ELSE {titleCol} END AS Type,
                    {sevCol} AS Severity,
                    COUNT(*) AS Count
                FROM {tableName}
                WHERE 1 = 1
                ";

                    var parameters = new DynamicParameters();

                    if (filter.Severity?.Count > 0)
                    {
                        sql += $" AND LOWER({sevCol}) IN @Severities";
                        parameters.Add("@Severities", filter.Severity.Select(s => s.ToLowerInvariant()).ToArray());
                    }

                    if (filter.TimeRange > 0)
                    {
                        var now = DateTime.Now;
                        var cutoff = now.AddMinutes(-filter.TimeRange);

                        sql += $" AND {tsCol} >= @Cutoff AND {tsCol} <= @Now";
                        parameters.Add("@Cutoff", cutoff);
                        parameters.Add("@Now", now);
                    }

                    sql += $@"
                GROUP BY 
                    CASE WHEN {titleCol} IS NULL OR {titleCol} = '' THEN 'N/A' ELSE {titleCol} END,
                    {sevCol}
                ORDER BY Count DESC";

                    return (await connection.QueryAsync<LogTypeCountDto>(sql, parameters)).ToList();
                },
                options: null);

            return Results.Ok(result);
        };
    }
}
