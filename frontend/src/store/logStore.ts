import { create } from "zustand";
import { LogEntry, LogTypeCount, TimeSeriesData, LogSeverity } from "../types";

interface ChartFilters {
  severity: LogSeverity[];
  timeRange: number; // minutes
}

interface LogFilters {
  searchTerm: string;
  fromDate: string;
  toDate: string;
  severity: LogSeverity[];
  page: number;
  pageSize: number;
}

interface LogState {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  timeSeriesData: TimeSeriesData[];
  topLogTypes: LogTypeCount[];
  isLoading: boolean;
  isPaused: boolean;
  chartFilters: ChartFilters;
  logFilters: LogFilters;
  selectedLog: LogEntry | null;
  error: string | null;

  // Actions
  setLogs: (logs: LogEntry[]) => void;
  setTimeSeriesData: (data: TimeSeriesData[]) => void;
  setTopLogTypes: (data: LogTypeCount[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setChartFilters: (filters: Partial<ChartFilters>) => void;
  setLogFilters: (filters: Partial<LogFilters>) => void;
  setSelectedLog: (log: LogEntry | null) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

const defaultChartFilters: ChartFilters = {
  severity: ["Error", "Warning", "Information", "Debug"],
  timeRange: 30, // last 30 minutes
};

const defaultLogFilters: LogFilters = {
  searchTerm: "",
  fromDate: "",
  toDate: "",
  severity: ["Error", "Warning", "Information", "Debug"],
  page: 1,
  pageSize: 50,
};

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  filteredLogs: [],
  timeSeriesData: [],
  topLogTypes: [],
  isLoading: false,
  isPaused: false,
  chartFilters: defaultChartFilters,
  logFilters: defaultLogFilters,
  selectedLog: null,
  error: null,

  setLogs: (logs) => set({ logs }),
  setTimeSeriesData: (timeSeriesData) => set({ timeSeriesData }),
  setTopLogTypes: (topLogTypes) => set({ topLogTypes }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setChartFilters: (filters) =>
    set((state) => ({
      chartFilters: { ...state.chartFilters, ...filters },
    })),
  setLogFilters: (filters) =>
    set((state) => ({
      logFilters: { ...state.logFilters, ...filters },
    })),
  setSelectedLog: (selectedLog) => set({ selectedLog }),
  setError: (error) => set({ error }),
  resetFilters: () =>
    set({
      chartFilters: defaultChartFilters,
      logFilters: defaultLogFilters,
    }),
}));
