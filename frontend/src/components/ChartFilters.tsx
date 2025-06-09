import React from "react";
import { BarChart3, Clock } from "../icons";
import { useLogStore } from "../store/logStore";
import { LogSeverity } from "../types";

const timeRangeOptions = [
  { value: 5, label: "5 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 180, label: "3 hours" },
  { value: 360, label: "6 hours" },
  { value: 720, label: "12 hours" },
  { value: 1440, label: "24 hours" },
];

const severityOptions: { value: LogSeverity; label: string; color: string }[] =
  [
    { value: "Error", label: "Error", color: "bg-red-500" },
    { value: "Warning", label: "Warning", color: "bg-amber-500" },
    { value: "Information", label: "Info", color: "bg-blue-500" },
    { value: "Debug", label: "Debug", color: "bg-green-500" },
  ];

const ChartFilters: React.FC = () => {
  const { chartFilters, setChartFilters } = useLogStore();

  const handleSeverityToggle = (severity: LogSeverity) => {
    const newSeverities = chartFilters.severity.includes(severity)
      ? chartFilters.severity.filter((s) => s !== severity)
      : [...chartFilters.severity, severity];

    setChartFilters({ severity: newSeverities });
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChartFilters({ timeRange: parseInt(e.target.value, 10) });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <BarChart3 className="h-5 w-5 text-blue-400 mr-2" />
        <h2 className="text-white font-medium">Chart Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Range */}
        <div>
          <label
            htmlFor="chartTimeRange"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            <Clock className="h-4 w-4 inline mr-1" />
            Time Range
          </label>
          <select
            id="chartTimeRange"
            value={chartFilters.timeRange}
            onChange={handleTimeRangeChange}
            className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Severity Levels
          </label>
          <div className="flex flex-wrap gap-2">
            {severityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSeverityToggle(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center transition-all ${
                  chartFilters.severity.includes(option.value)
                    ? option.color + " text-white shadow-md"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${option.color}`}
                ></span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartFilters;
