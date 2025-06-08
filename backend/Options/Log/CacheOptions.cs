namespace LogInfoApi.Options.Log;

public class CacheOptions
{
    public required EndpointCacheOption GetLogs { get; set; }
    public required EndpointCacheOption GetLogTimeseries { get; set; }
    public required EndpointCacheOption GetLogTypes { get; set; }
}
