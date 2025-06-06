namespace LogInfoApi.Dtos;

public class ChartFilters
{
    public List<string> Severity { get; set; } = [];
    public int TimeRange { get; set; }

    public string ToCacheKey()
    {
        var severityPart = Severity != null && Severity.Any()
            ? string.Join("-", Severity.Select(s => s.ToLowerInvariant()).OrderBy(s => s))
            : "none";

        return $"severity:{severityPart}_timerange:{TimeRange}";
    }
}