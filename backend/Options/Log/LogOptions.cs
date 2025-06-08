namespace LogInfoApi.Options.Log;

public class LogOptions
{
    public required string TableName { get; set; }
    public required LogColumns Columns { get; set; }
    public required Dictionary<string, string> SeverityValues { get; set; }
    public required CacheOptions CacheOptions { get; set; }
}
