using Dapper;
using LogInfoApi.Dtos;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Hybrid;

namespace LogInfoApi.Endpoints;

public static partial class LogsEndpoints
{
    public static Func<ChartFilters, IConfiguration, HybridCache, Task<IResult>> GetLogTimeseries()
    {
        return async (ChartFilters filter, IConfiguration configuration, HybridCache cache) =>
        {
            if (filter == null || filter.TimeRange <= 0)
                return Results.BadRequest("Invalid filter or TimeRange.");

            CalculateGraph(filter, out var bucketSize, out var start, out var end);

            var result = await cache.GetOrCreateAsync(
                key: $"timeseries-{filter.ToCacheKey()}",
                factory: async (ct) =>
                {
                    await using var connection = new SqlConnection(configuration.GetConnectionString("Database"));

                    var sql = @"
                ;WITH TimeBuckets AS (
                    SELECT @Start AS BucketTime
                    UNION ALL
                    SELECT DATEADD(MINUTE, @BucketSize, BucketTime)
                    FROM TimeBuckets
                    WHERE DATEADD(MINUTE, @BucketSize, BucketTime) <= @End
                ),
                FilteredLogs AS (
                    SELECT
                        DATEADD(
                            MINUTE,
                            DATEDIFF(MINUTE, 0, Timestamp) / @BucketSize * @BucketSize,
                            0
                        ) AS BucketTime,
                        LOWER(Severity) AS Severity
                    FROM Log
                    WHERE Timestamp >= @Start AND Timestamp <= @End
                    /** {SeverityFilter} **/
                )
                SELECT
                    CONVERT(VARCHAR, tb.BucketTime, 126) AS [Time],
                    ISNULL(SUM(CASE WHEN fl.Severity = 'Error' THEN 1 ELSE 0 END), 0) AS Errors,
                    ISNULL(SUM(CASE WHEN fl.Severity = 'Warning' THEN 1 ELSE 0 END), 0) AS Warnings,
                    ISNULL(SUM(CASE WHEN fl.Severity = 'Information' THEN 1 ELSE 0 END), 0) AS Infos,
                    ISNULL(SUM(CASE WHEN fl.Severity = 'Debug' THEN 1 ELSE 0 END), 0) AS Debugs
                FROM TimeBuckets tb
                LEFT JOIN FilteredLogs fl ON tb.BucketTime = fl.BucketTime
                GROUP BY tb.BucketTime
                ORDER BY tb.BucketTime
                OPTION (MAXRECURSION 0);
                ";

                    var parameters = new DynamicParameters();

                    parameters.Add("@Start", start);
                    parameters.Add("@End", end);
                    parameters.Add("@BucketSize", bucketSize);

                    if (filter.Severity?.Count > 0)
                    {
                        sql = sql.Replace("/** {SeverityFilter} **/", "AND LOWER(Severity) IN @Severities");
                        parameters.Add("@Severities", filter.Severity.Select(s => s.ToString().ToLower()).ToArray());
                    }
                    else
                    {
                        sql = sql.Replace("/** {SeverityFilter} **/", "");
                    }

                    return (await connection.QueryAsync<TimeSeriesDataDto>(sql, parameters)).ToList();
                });

            return Results.Ok(result);
        };
    }

    private static void CalculateGraph(ChartFilters filter, out int bucketSize, out DateTime start, out DateTime end)
    {
        bucketSize = filter.TimeRange switch
        {
            <= 60 => 1,
            <= 180 => 5,
            <= 720 => 15,
            <= 1440 => 30,
            _ => 60
        };

        var now = DateTime.Now;

        start = RoundDownToBucket(now.AddMinutes(-filter.TimeRange), bucketSize);
        end = RoundDownToBucket(now, bucketSize);
    }

    private static DateTime RoundDownToBucket(DateTime dateTime, int bucketSize)
    {
        var minutes = dateTime.Minute - (dateTime.Minute % bucketSize);
        return new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, dateTime.Hour, 0, 0, DateTimeKind.Local)
                .AddMinutes(minutes);
    }
}
