using Microsoft.Extensions.Caching.Hybrid;
using System.Collections.Concurrent;

namespace LogInfoApi.Cache;

public class SwrCache(HybridCache cache, ILogger<SwrCache> logger)
{
    // TODO: ConcurrentDictionaries can grow indefinitely, consider implementing a cleanup strategy or using mechanism with expiration.
    private readonly static ConcurrentDictionary<string, DateTime> LastRefreshTimePerKey = new();
    private readonly static ConcurrentDictionary<string, SemaphoreSlim> SemaphorePerKey = new();

    public async Task<T> GetOrSaveAsync<T>(
        string key,
        Func<CancellationToken, ValueTask<T>> factory,
        TimeSpan validExpirationTimeSpan,
        TimeSpan totalExpirationTimeSpan)
    {
        if (ShouldRevalidate(key, validExpirationTimeSpan))
        {
            var semaphore = SemaphorePerKey.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));

            if (await semaphore.WaitAsync(0))
            {
                try
                {
                    var newValue = await factory(default);

                    await cache.SetAsync(key, newValue, new HybridCacheEntryOptions
                    {
                        Expiration = totalExpirationTimeSpan
                    });

                    LastRefreshTimePerKey[key] = DateTime.Now;
                }
                catch(Exception exception)
                {
                    logger.LogError(exception, "Failed updating stale cache");
                }
                finally
                {
                    semaphore.Release();
                }
            } 
        }

        return await cache.GetOrCreateAsync(
                key: key,
                factory: async (ct) =>
                {
                    var value = await factory(ct);

                    LastRefreshTimePerKey[key] = DateTime.Now;

                    return value;
                },
                options: new()
                {
                    Expiration = totalExpirationTimeSpan
                });
    }

    private static bool ShouldRevalidate(string key, TimeSpan validExpirationTimeSpan)
    {
        return LastRefreshTimePerKey.TryGetValue(key, out var lastRefresh)
               && lastRefresh.AddSeconds(validExpirationTimeSpan.TotalSeconds) < DateTime.Now;
    }
}
