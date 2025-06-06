export type LogSeverity = "Error" | "Warning" | "Information" | "Debug";

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: string;
  severity: LogSeverity;
  machine: string;
  stackTrace: string;
  applicationName?: string;
  source?: string;
  count?: number;
}

export interface LogTypeCount {
  type: string;
  count: number;
  severity: LogSeverity;
}

export interface TimeSeriesData {
  time: string;
  errors: number;
  warnings: number;
  infos: number;
  debugs: number;
}

export interface FilterOptions {
  severity: LogSeverity[];
  timeRange: number; // minutes
  searchTerm: string;
  machines: string[];
  types: string[];
  applications: string[];
  pollingInterval: number; // seconds
}

export interface ChartFilters {
  severity: LogSeverity[];
  timeRange: number; // minutes
}

export interface LogFilters {
  searchTerm: string;
  fromDate: string;
  toDate: string;
  severity: LogSeverity[];
  page: number;
  pageSize: number;
}
