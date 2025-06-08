import React from "react";
import { Search, Calendar, Filter } from "lucide-react";
import { useLogStore } from "../store/logStore";
import { LogSeverity } from "../types";
import { useLogData } from "../hooks/useLogData";

const severityOptions: { value: LogSeverity; label: string; color: string }[] =
  [
    { value: "Error", label: "Error", color: "bg-red-500" },
    { value: "Warning", label: "Warning", color: "bg-amber-500" },
    { value: "Information", label: "Info", color: "bg-blue-500" },
    { value: "Debug", label: "Debug", color: "bg-green-500" },
  ];

const LogFilters: React.FC = () => {
  const { logFilters, setLogFilters } = useLogStore();
  const { refetchLogs } = useLogData();

  const handleSeverityToggle = (severity: LogSeverity) => {
    const newSeverities = logFilters.severity.includes(severity)
      ? logFilters.severity.filter((s) => s !== severity)
      : [...logFilters.severity, severity];

    setLogFilters({ severity: newSeverities });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogFilters({ searchTerm: e.target.value });
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogFilters({ fromDate: e.target.value });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogFilters({ toDate: e.target.value });
  };

  const handleApplyFilters = () => {
    refetchLogs();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-blue-400 mr-2" />
        <h2 className="text-white font-medium">Log Search & Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label
            htmlFor="logSearch"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            <Search className="h-4 w-4 inline mr-1" />
            Search Logs
          </label>
          <input
            type="text"
            id="logSearch"
            value={logFilters.searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            placeholder="Search in logs... (Press Enter to apply)"
            className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* From Date */}
        <div>
          <label
            htmlFor="fromDate"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            <Calendar className="h-4 w-4 inline mr-1" />
            From Date
          </label>
          <input
            type="datetime-local"
            id="fromDate"
            value={logFilters.fromDate}
            onChange={handleFromDateChange}
            onKeyPress={handleKeyPress}
            className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* To Date */}
        <div>
          <label
            htmlFor="toDate"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            <Calendar className="h-4 w-4 inline mr-1" />
            To Date
          </label>
          <input
            type="datetime-local"
            id="toDate"
            value={logFilters.toDate}
            onChange={handleToDateChange}
            onKeyPress={handleKeyPress}
            className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Severity
          </label>
          <div className="flex flex-wrap gap-1">
            {severityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSeverityToggle(option.value)}
                className={`px-2 py-1 rounded text-xs font-medium flex items-center transition-all ${
                  logFilters.severity.includes(option.value)
                    ? option.color + " text-white"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${option.color}`}
                ></span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleApplyFilters}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm transition-colors font-medium"
        >
          Apply Filters & Search
        </button>
      </div>
    </div>
  );
};

export default LogFilters;
