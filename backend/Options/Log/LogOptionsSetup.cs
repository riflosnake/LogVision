namespace LogInfoApi.Options.Log;

public static class LogOptionsSetup
{
    public static IServiceCollection AddLogOptions(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptionsWithValidateOnStart<LogOptions>()
                .Bind(configuration.GetSection(nameof(LogOptions)))
                .Validate(options =>
                    !string.IsNullOrWhiteSpace(options.TableName) &&
                    options.Columns != null &&
                    !string.IsNullOrWhiteSpace(options.Columns.Id) &&
                    !string.IsNullOrWhiteSpace(options.Columns.Timestamp) &&
                    !string.IsNullOrWhiteSpace(options.Columns.Message) &&
                    !string.IsNullOrWhiteSpace(options.Columns.Title) &&
                    !string.IsNullOrWhiteSpace(options.Columns.Severity) &&
                    !string.IsNullOrWhiteSpace(options.Columns.Machine) &&
                    !string.IsNullOrWhiteSpace(options.Columns.StackTrace) &&
                    !string.IsNullOrWhiteSpace(options.Columns.ApplicationName) &&
                    !string.IsNullOrWhiteSpace(options.Columns.Source) &&
                    options.SeverityValues != null &&
                    options.SeverityValues.Count > 0,
                    "LogOptions validation failed: All LogColumns properties and SeverityValues must be set.");

        return services;
    }
}
