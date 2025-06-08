using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Caching.Memory;

namespace LogInfoApi.Cache;

public class SwrCache(
    HybridCache hybridCache,
    IMemoryCache memoryCache,
    ILogger<SwrCache> logger)
{
    public async Task<T> GetOrSaveAsync<T>(
        string key,
        Func<CancellationToken, ValueTask<T>> factory,
        TimeSpan validExpiration,
        TimeSpan totalExpiration)
    {
        if (ShouldRevalidate(key, validExpiration))
        {
            SemaphoreSlim semaphore = GetSemaphoreOfKey(key, totalExpiration);

            if (await semaphore.WaitAsync(0))
            {
                try
                {
                    var newValue = await factory(CancellationToken.None);

                    await hybridCache.SetAsync(key, newValue, new HybridCacheEntryOptions
                    {
                        Expiration = totalExpiration
                    });

                    SaveLastRefreshTime(key, totalExpiration);
                }
                catch (Exception exception)
                {
                    logger.LogError(exception, "Failed updating stale cache");
                }
                finally
                {
                    semaphore.Release();
                }
            }
        }

        return await hybridCache.GetOrCreateAsync(
                key: key,
                factory: async (ct) =>
                {
                    var value = await factory(ct);

                    SaveLastRefreshTime(key, totalExpiration);

                    return value;
                },
                options: new()
                {
                    Expiration = totalExpiration
                });
    }

    private SemaphoreSlim GetSemaphoreOfKey(string key, TimeSpan totalExpiration)
        => memoryCache.TryGetValue(ToSemaphoreKey(key), out SemaphoreSlim? existingSemaphore)
                        ? existingSemaphore!
                        : memoryCache.Set(
                            key: ToSemaphoreKey(key),
                            value: new SemaphoreSlim(1, 1),
                            options: new MemoryCacheEntryOptions
                            {
                                AbsoluteExpirationRelativeToNow = totalExpiration
                            });

    private bool ShouldRevalidate(string key, TimeSpan validExpiration)
        => memoryCache.TryGetValue(ToRefreshKey(key), out DateTime lastRefresh)
               && lastRefresh.AddSeconds(validExpiration.TotalSeconds) < DateTime.Now;

    private void SaveLastRefreshTime(string key, TimeSpan totalExpiration)
        => memoryCache.Set(
            key: ToRefreshKey(key),
            value: DateTime.Now,
            options: new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = totalExpiration
            });

    private static string ToSemaphoreKey(string key) => $"semaphore:{key}";
    private static string ToRefreshKey(string key) => $"refresh:{key}";
}
