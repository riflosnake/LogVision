namespace LogInfoApi.Options.Log;

public class EndpointCacheOption
{
    public bool IsEnabled { get; set; }
    public int Stale { get; set; }
    public int Total { get; set; }
}