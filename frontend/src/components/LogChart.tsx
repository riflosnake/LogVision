import React from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import { formatChartTime } from "../utils/formatters";
import { TimeSeriesData } from "../types";

interface LogChartProps {
  data: TimeSeriesData[];
  isLoading: boolean;
}

const LogChart: React.FC<LogChartProps> = ({ data, isLoading }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-[320px] flex flex-col">
      <div className="flex items-center mb-4">
        <LineChartIcon className="h-5 w-5 text-blue-400 mr-2" />
        <h2 className="text-white font-medium">Log Activity Over Time</h2>
      </div>

      {isLoading && data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">
            Loading chart data...
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorWarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorInfos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorDebugs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#9ca3af" }}
                tickFormatter={formatChartTime}
              />
              <YAxis tick={{ fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "0.375rem",
                }}
                labelStyle={{ color: "#f3f4f6" }}
                formatter={(value, name) => {
                  return [
                    value,
                    typeof name === "string"
                      ? name.charAt(0).toUpperCase() + name.slice(1)
                      : name,
                  ];
                }}
                labelFormatter={(label) => formatChartTime(label)}
              />
              <Legend
                wrapperStyle={{ color: "#d1d5db" }}
                formatter={(value) =>
                  value.charAt(0).toUpperCase() + value.slice(1)
                }
              />
              <Area
                type="monotone"
                dataKey="errors"
                name="Errors"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorErrors)"
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="warnings"
                name="Warnings"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWarnings)"
              />
              <Area
                type="monotone"
                dataKey="infos"
                name="Information"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorInfos)"
              />
              <Area
                type="monotone"
                dataKey="debugs"
                name="Debug"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDebugs)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default LogChart;
