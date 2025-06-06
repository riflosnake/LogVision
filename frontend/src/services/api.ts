import {
  ChartFilters,
  LogFilters,
  LogEntry,
  LogTypeCount,
  TimeSeriesData,
  LogSeverity,
} from "../types";

// This is a mock API service that would be replaced with actual
// API calls to your .NET backend
const baseUrl = "http://localhost:8080";

// In a real implementation, this would call your .NET backend
export async function fetchLogs(filters: LogFilters): Promise<LogEntry[]> {
  // For now, we'll simulate this with mock data
  try {
    const response = await fetch(`${baseUrl}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch logs");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching logs:", error);
    // Return mock data for development
    return generateMockLogs(filters);
  }
}

export async function fetchTimeSeriesData(
  filters: ChartFilters
): Promise<TimeSeriesData[]> {
  try {
    const response = await fetch(`${baseUrl}/logs/timeseries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch time series data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching time series data:", error);
    // Return mock data for development
    return generateMockTimeSeriesData(filters);
  }
}

export async function fetchTopLogTypes(
  filters: ChartFilters
): Promise<LogTypeCount[]> {
  try {
    const response = await fetch(`${baseUrl}/logs/types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch top log types");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching top log types:", error);
    // Return mock data for development
    return generateMockTopLogTypes();
  }
}

// Mock data generation for development
function generateMockLogs(filters: LogFilters): LogEntry[] {
  const severities: Array<LogSeverity> = [
    "Error",
    "Warning",
    "Information",
    "Debug",
  ];
  const types = [
    "NullReferenceException",
    "ArgumentException",
    "FileNotFoundException",
    "DbConnectionException",
    "AuthenticationFailure",
    "TimeoutException",
    "ValidationError",
    "ApiRateLimitExceeded",
    "ConfigurationError",
    "PermissionDenied",
  ];
  const machines = ["WEB-01", "WEB-02", "API-01", "DB-01", "CACHE-01"];
  const applications = ["WebApp", "ApiService", "AuthService", "DataProcessor"];

  const logs: LogEntry[] = [];

  // Generate logs based on date range or default time range
  const now = new Date();
  let startTime: Date;
  let endTime: Date;

  if (filters.fromDate && filters.toDate) {
    startTime = new Date(filters.fromDate);
    endTime = new Date(filters.toDate);
  } else {
    // Default to last 24 hours
    startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    endTime = now;
  }

  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(
      startTime.getTime() +
        Math.random() * (endTime.getTime() - startTime.getTime())
    );
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const machine = machines[Math.floor(Math.random() * machines.length)];
    const application =
      applications[Math.floor(Math.random() * applications.length)];

    // Apply severity filter
    if (!filters.severity.includes(severity)) continue;

    // Apply search filter
    const message = `${severity.toUpperCase()}: ${type} occurred during operation`;
    if (
      filters.searchTerm &&
      !message.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !type.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !machine.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !application.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
      continue;
    }

    logs.push({
      id: `log-${i}`,
      timestamp: timestamp.toISOString(),
      message,
      type,
      severity,
      machine,
      applicationName: application,
      source: `${application}.Services.${type.replace("Exception", "Handler")}`,
      stackTrace: generateMockStackTrace(type, application),
    });
  }

  // Sort by timestamp, newest first
  return logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function generateMockStackTrace(type: string, application: string): string {
  return `${type}: Object reference not set to an instance of an object.
   at ${application}.Services.UserService.GetUserDetails(Int32 userId) in D:\\Projects\\${application}\\Services\\UserService.cs:line 42
   at ${application}.Controllers.UserController.GetUser(Int32 id) in D:\\Projects\\${application}\\Controllers\\UserController.cs:line 28
   at lambda_method(Closure , Object , Object[] )
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.SyncActionResultExecutor.Execute(IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.InvokeActionMethodAsync()
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.InvokeNextActionFilterAsync()`;
}

function generateMockTimeSeriesData(filters: ChartFilters): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  const startTime = new Date(now.getTime() - filters.timeRange * 60 * 1000);

  // Generate one data point per minute
  for (let i = 0; i <= filters.timeRange; i++) {
    const time = new Date(startTime.getTime() + i * 60 * 1000);

    // More stable data generation with slight variations
    const baseErrors = Math.floor(Math.random() * 3 + 1);
    const baseWarnings = Math.floor(Math.random() * 5 + 2);
    const baseInfos = Math.floor(Math.random() * 8 + 5);
    const baseDebugs = Math.floor(Math.random() * 10 + 8);

    data.push({
      time: time.toISOString(),
      errors: filters.severity.includes("Error") ? baseErrors : 0,
      warnings: filters.severity.includes("Warning") ? baseWarnings : 0,
      infos: filters.severity.includes("Information") ? baseInfos : 0,
      debugs: filters.severity.includes("Debug") ? baseDebugs : 0,
    });
  }

  return data;
}

function generateMockTopLogTypes(): LogTypeCount[] {
  const types = [
    { type: "NullReferenceException", count: 28, severity: "Error" as const },
    { type: "ArgumentException", count: 21, severity: "Error" as const },
    { type: "ValidationError", count: 18, severity: "Warning" as const },
    { type: "TimeoutException", count: 15, severity: "Error" as const },
    { type: "DbConnectionException", count: 12, severity: "Error" as const },
    { type: "AuthenticationFailure", count: 10, severity: "Warning" as const },
    { type: "ApiRateLimitExceeded", count: 8, severity: "Warning" as const },
    { type: "FileNotFoundException", count: 7, severity: "Error" as const },
    { type: "ConfigurationError", count: 5, severity: "Information" as const },
    { type: "PermissionDenied", count: 3, severity: "Warning" as const },
  ];

  return types;
}
