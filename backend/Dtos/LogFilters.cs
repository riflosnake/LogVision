namespace LogInfoApi.Dtos;

public class LogFilters
{
    public string SearchTerm { get; set; } = string.Empty;
    public string FromDate { get; set; } = string.Empty;
    public string ToDate { get; set; } = string.Empty;
    public List<string> Severity { get; set; } = [];
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;

    public string ToCacheKey()
    {
        var severityPart = Severity.Count != 0
            ? string.Join("-", Severity.Select(s => s.ToLowerInvariant()).OrderBy(s => s))
            : "none";

        return $"search:{SearchTerm ?? ""}_" +
               $"from:{FromDate ?? ""}_" +
               $"to:{ToDate ?? ""}_" +
               $"severity:{severityPart}_" +
               $"page:{Page}_" +
               $"pageSize:{PageSize}";
    }
}