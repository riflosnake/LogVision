using Dapper;
using LogInfoApi.Cache;
using LogInfoApi.Dtos;
using LogInfoApi.Options.Log;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace LogInfoApi.Endpoints;

public static partial class LogsEndpoints
{
    public static async Task<IResult> GetLogTimeseries(
        ChartFilters filters,
        IOptions<LogOptions> options,
        IConfiguration configuration,
        SwrCache swrCache)
    {
        if (filters is null || filters.TimeRange <= 0)
            return Results.BadRequest("Invalid filter or TimeRange.");

        var cacheOptions = options.Value.CacheOptions.GetLogTimeseries;

        if (!cacheOptions.IsEnabled)
        {
            return Results.Ok(await GetLogsTimeseriesAsync(filters, options, configuration));
        }

        var result = await swrCache.GetOrSaveAsync(
            key: filters.ToCacheKey(nameof(GetLogTimeseries)),
            factory: async (ct) => await GetLogsTimeseriesAsync(filters, options, configuration),
            validExpirationTimeSpan: TimeSpan.FromSeconds(cacheOptions.Stale),
            totalExpirationTimeSpan: TimeSpan.FromSeconds(cacheOptions.Total));

        return Results.Ok(result);
    }

    private static async Task<List<TimeSeriesDataDto>> GetLogsTimeseriesAsync(
        ChartFilters filters,
        IOptions<LogOptions> options,
        IConfiguration configuration)
    {
        CalculateGraph(filters, out var bucketSize, out var start, out var end);

        var logOptions = options.Value;

        var tableName = logOptions.TableName;

        var timestampColumn = logOptions.Columns.Timestamp;
        var severityColumn = logOptions.Columns.Severity;
        var severityMapping = logOptions.SeverityValues ?? [];

        var sql = $@"
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
                            DATEDIFF(MINUTE, 0, {timestampColumn}) / @BucketSize * @BucketSize,
                            0
                        ) AS BucketTime,
                        LOWER({severityColumn}) AS Severity
                    FROM {tableName}
                    WHERE {timestampColumn} >= @Start AND {timestampColumn} <= @End
                    /** SeverityFilter **/
                )
                SELECT
                    CONVERT(VARCHAR, tb.BucketTime, 126) AS [Time],";

        foreach (var sev in new[] { "Error", "Warning", "Information", "Debug" })
        {
            var sevVal = severityMapping.GetValueOrDefault(sev, sev.ToLower());
            sql += $@"
                            ISNULL(SUM(CASE WHEN fl.Severity = '{sevVal}' THEN 1 ELSE 0 END), 0) AS {sev}s,";
        }

        sql = sql.TrimEnd(',');

        sql += @"
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

        if (filters.Severity?.Count > 0)
        {
            sql = sql.Replace("/** SeverityFilter **/", $"AND LOWER({severityColumn}) IN @Severities");
            parameters.Add("@Severities", filters.Severity.Select(s => s.ToString().ToLower()).ToArray());
        }
        else
        {
            sql = sql.Replace("/** SeverityFilter **/", "");
        }

        await using var connection = new SqlConnection(configuration.GetConnectionString("Database"));

        return (await connection.QueryAsync<TimeSeriesDataDto>(sql, parameters)).ToList();
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
