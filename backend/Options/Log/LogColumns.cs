namespace LogInfoApi.Options.Log;

public class LogColumns
{
    public required string Id { get; set; }
    public required string Timestamp { get; set; }
    public required string Message { get; set; }
    public required string Title { get; set; }
    public required string Severity { get; set; }
    public required string Machine { get; set; }
    public required string StackTrace { get; set; }
    public required string ApplicationName { get; set; }
    public required string Source { get; set; }
}
