namespace LogInfoApi.Options.Log;

public class LogOptions
{
    public string TableName { get; set; }
    public LogColumns Columns { get; set; }
    public Dictionary<string, string> SeverityValues { get; set; }
}

public class LogColumns
{
    public string Id { get; set; }
    public string Timestamp { get; set; }
    public string Message { get; set; }
    public string Title { get; set; }
    public string Severity { get; set; }
    public string Machine { get; set; }
    public string StackTrace { get; set; }
    public string ApplicationName { get; set; }
    public string Source { get; set; }
}
