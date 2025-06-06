namespace LogInfoApi.Dtos;

public class TimeSeriesDataDto
{
    public string Time { get; set; } = default!;
    public int Errors { get; set; }
    public int Warnings { get; set; }
    public int Infos { get; set; }
    public int Debugs { get; set; }
}
