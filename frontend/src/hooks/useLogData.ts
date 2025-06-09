import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogEntry, LogTypeCount, TimeSeriesData } from "../types";
import { useLogStore } from "../store/logStore";
import {
  fetchLogs,
  fetchTimeSeriesData,
  fetchTopLogTypes,
} from "../services/api";
import { useCallback, useEffect } from "react";

export function useLogData() {
  const {
    chartFilters,
    logFilters,
    setLogs,
    setTimeSeriesData,
    setTopLogTypes,
    isPaused,
  } = useLogStore();

  const queryClient = useQueryClient();

  // TODO: Disable fetching on change of searchTerm
  // Best UX would be to debounce the search term input
  // and only fetch logs when the user stops typing for a while.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { searchTerm, ...filtersWithoutSearchTerm } = logFilters;

  const logsQuery = useQuery<LogEntry[], Error>({
    queryKey: ["logs", filtersWithoutSearchTerm],
    queryFn: () => fetchLogs(logFilters),
    enabled: !!logFilters,
    staleTime: 1_000,
  });

  const timeSeriesQuery = useQuery<TimeSeriesData[], Error>({
    queryKey: ["timeSeries", chartFilters],
    queryFn: () => fetchTimeSeriesData(chartFilters),
    enabled: !!chartFilters,
    refetchInterval: isPaused ? false : 5_000,
    staleTime: 2_000,
  });

  const topTypesQuery = useQuery<LogTypeCount[], Error>({
    queryKey: ["topLogTypes", chartFilters],
    queryFn: () => fetchTopLogTypes(chartFilters),
    enabled: !!chartFilters,
    refetchInterval: isPaused ? false : 5_000,
    staleTime: 2_000,
  });

  const refetchAll = useCallback(async () => {
    const keys = ["logs", "timeSeries", "topLogTypes"];

    await Promise.all(
      keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    );
  }, [queryClient]);

  useEffect(() => {
    if (logsQuery.data) {
      setLogs(logsQuery.data);
    }
  }, [logsQuery.data, setLogs]);

  useEffect(() => {
    if (timeSeriesQuery.data) {
      setTimeSeriesData(timeSeriesQuery.data);
    }
  }, [setTimeSeriesData, timeSeriesQuery.data]);

  useEffect(() => {
    if (topTypesQuery.data) {
      setTopLogTypes(topTypesQuery.data);
    }
  }, [setTopLogTypes, topTypesQuery.data]);

  return {
    logs: logsQuery.data,
    timeSeriesData: timeSeriesQuery.data,
    topLogTypes: topTypesQuery.data,
    isLogsQueryLoading: logsQuery.isLoading,
    isTimeSeriesQueryLoading: timeSeriesQuery.isLoading,
    isTopTypesQueryLoading: topTypesQuery.isLoading,
    isLoading:
      logsQuery.isLoading ||
      timeSeriesQuery.isLoading ||
      topTypesQuery.isLoading,
    error: logsQuery.error || timeSeriesQuery.error || topTypesQuery.error,
    refetchAll,
    refetchLogs: logsQuery.refetch,
    refetchCharts: () => {
      timeSeriesQuery.refetch();
      topTypesQuery.refetch();
    },
  };
}
