namespace LogInfoApi.Dtos;

public class LogEntryDto
{
    public string Id { get; set; } = default!;
    public string Timestamp { get; set; } = default!;
    public string Message { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string Severity { get; set; } = default!;
    public string Machine { get; set; } = default!;
    public string StackTrace { get; set; } = default!;
    public string? ApplicationName { get; set; }
    public string? Source { get; set; }
    public int? Count { get; set; }
}
