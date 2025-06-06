using Dapper;
using LogInfoApi.Dtos;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Hybrid;

namespace LogInfoApi.Endpoints;

public static partial class LogsEndpoints
{
    public static Func<ChartFilters, IConfiguration, HybridCache, Task<IResult>> GetLogTypes()
    {
        return async (ChartFilters filter, IConfiguration configuration, HybridCache cache) =>
        {
            if (filter == null)
                return Results.BadRequest("Filter cannot be null.");

            var result = await cache.GetOrCreateAsync(
                key: $"types-{filter.ToCacheKey()}",
                factory: async (ct) =>
                {
                    await using var connection = new SqlConnection(configuration.GetConnectionString("Database"));

                    var sql = @"
                    SELECT TOP 10
                        CASE WHEN Title IS NULL OR Title = '' THEN 'N/A' ELSE Title END AS Type,
                        Severity AS Severity,
                        COUNT(*) AS Count
                    FROM Log
                    WHERE 1=1
                    ";

                    var parameters = new DynamicParameters();

                    if (filter.Severity?.Count > 0)
                    {
                        sql += " AND Severity IN @Severities";
                        parameters.Add("@Severities", filter.Severity.Select(s => s.ToLowerInvariant()).ToArray());
                    }

                    if (filter.TimeRange > 0)
                    {
                        var now = DateTime.Now;
                        var cutoff = now.AddMinutes(-filter.TimeRange);

                        sql += " AND Timestamp >= @Cutoff AND Timestamp <= @Now";
                        parameters.Add("@Cutoff", cutoff);
                        parameters.Add("@Now", now);
                    }

                    sql += @"
                    GROUP BY 
                        CASE WHEN Title IS NULL OR Title = '' THEN 'N/A' ELSE Title END,
                        Severity
                    ORDER BY Count DESC";

                    return (await connection.QueryAsync<LogTypeCountDto>(sql, parameters)).ToList();
                },
                options: null);

            return Results.Ok(result);
        };
    }
}
