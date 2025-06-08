using System.Diagnostics.CodeAnalysis;

namespace LogInfoApi.Dtos;

public class LogFilters
{
    public string SearchTerm { get; set; } = string.Empty;
    public string FromDate { get; set; } = string.Empty;
    public string ToDate { get; set; } = string.Empty;
    public List<string> Severity { get; set; } = [];
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;

    public bool ShouldCache([NotNullWhen(true)] out string? cacheKey)
    {
        if (ShouldCache())
        {
            cacheKey = ToCacheKey();
            return true;
        }

        cacheKey = default;
        return false;
    }

    private string ToCacheKey()
    {
        var severityPart = Severity == null || Severity.Count == 0
        ? "all"
        : string.Join("-", Severity.Select(s => s.ToLowerInvariant()).OrderBy(s => s));

        return $"severity:{severityPart}_" +
               $"page:{Page}_" +
               $"pageSize:{PageSize}";
    }

    private bool ShouldCache()
        => string.IsNullOrWhiteSpace(SearchTerm) &&
           string.IsNullOrWhiteSpace(FromDate) &&
           string.IsNullOrWhiteSpace(ToDate);
}