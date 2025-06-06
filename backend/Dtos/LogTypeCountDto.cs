namespace LogInfoApi.Dtos;

public class LogTypeCountDto
{
    public string Type { get; set; } = default!;
    public int Count { get; set; }
    public string Severity { get; set; } = default!;
}
