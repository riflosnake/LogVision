using LogInfoApi.Endpoints;
using Microsoft.Extensions.Caching.Hybrid;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCompression();

builder.Services.AddCors(config =>
{
    config.AddPolicy("log-api-policy",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

builder.Services.AddAuthorization();

builder.Services.AddHybridCache(options =>
{
    const int OneMb = 1024 * 1024 * 1;

    options.MaximumPayloadBytes = OneMb;
    options.MaximumKeyLength = 512;

    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMilliseconds(1_999),
    };
});

var app = builder.Build();

app.UseCors("log-api-policy");

app.UseResponseCompression();

app.MapPost("/logs", LogsEndpoints.GetLogs());
app.MapPost("/logs/timeseries", LogsEndpoints.GetLogTimeseries());
app.MapPost("/logs/types", LogsEndpoints.GetLogTypes());

app.UseHttpsRedirection();

app.UseAuthorization();

app.Run();
