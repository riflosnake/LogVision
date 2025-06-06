import { useEffect } from "react";
import { useLogStore } from "../store/logStore";
import {
  fetchLogs,
  fetchTimeSeriesData,
  fetchTopLogTypes,
} from "../services/api";
import { pausePolling, startPolling } from "../utils/pollingManager";

export function useLogData() {
  const {
    logs,
    filteredLogs,
    timeSeriesData,
    topLogTypes,
    isLoading,
    isPaused,
    chartFilters,
    logFilters,
    error,
    setLogs,
    setFilteredLogs,
    setTimeSeriesData,
    setTopLogTypes,
    setIsLoading,
    setError,
  } = useLogStore();

  // Setup polling for charts when isPaused or chartFilters change
  useEffect(() => {
    if (!isPaused) {
      startPolling(fetchChartData);
    } else {
      pausePolling();
    }

    return () => {
      // Optional: you may choose to stop polling only when all components unmount, or keep running
      // stopPolling();
    };
  }, [isPaused, chartFilters]);

  // Fetch chart data (time series and top log types)
  const fetchChartData = async () => {
    try {
      const [timeSeriesData, topTypesData] = await Promise.all([
        fetchTimeSeriesData(chartFilters),
        fetchTopLogTypes(chartFilters),
      ]);

      setTimeSeriesData(timeSeriesData);
      setTopLogTypes(topTypesData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching chart data"
      );
    }
  };

  // Fetch log data (for table) - called when log filters are applied
  const fetchLogData = async () => {
    setIsLoading(true);
    try {
      const logsData = await fetchLogs(logFilters);
      setLogs(logsData);
      setFilteredLogs(logsData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching logs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all data at once (for initial load and refresh)
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [logsData, timeSeriesData, topTypesData] = await Promise.all([
        fetchLogs(logFilters),
        fetchTimeSeriesData(chartFilters),
        fetchTopLogTypes(chartFilters),
      ]);

      setLogs(logsData);
      setFilteredLogs(logsData);
      setTimeSeriesData(timeSeriesData);
      setTopLogTypes(topTypesData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logs,
    filteredLogs,
    timeSeriesData,
    topLogTypes,
    isLoading,
    error,
    fetchAllData,
    fetchLogData,
    fetchChartData,
  };
}
