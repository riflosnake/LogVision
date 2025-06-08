import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogEntry, LogTypeCount, TimeSeriesData } from "../types";
import { useLogStore } from "../store/logStore";
import {
  fetchLogs,
  fetchTimeSeriesData,
  fetchTopLogTypes,
} from "../services/api";
import { useEffect } from "react";

export function useLogData() {
  const {
    chartFilters,
    logFilters,
    setLogs,
    setFilteredLogs,
    setTimeSeriesData,
    setTopLogTypes,
    isPaused,
  } = useLogStore();

  const queryClient = useQueryClient();

  const logsQuery = useQuery<LogEntry[], Error>({
    queryKey: ["logs", logFilters],
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

  useEffect(() => {
    if (logsQuery.data) {
      setLogs(logsQuery.data);
      setFilteredLogs(logsQuery.data);
    }
  }, [logsQuery.data, setFilteredLogs, setLogs]);

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

  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["logs"] }),
      queryClient.invalidateQueries({ queryKey: ["timeSeries"] }),
      queryClient.invalidateQueries({ queryKey: ["topLogTypes"] }),
    ]);
  };

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
