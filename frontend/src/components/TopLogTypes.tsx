import React from "react";
import { BarChart } from "../icons";
import { LogTypeCount } from "../types";
import { getSeverityBgColor } from "../utils/formatters";

interface TopLogTypesProps {
  data: LogTypeCount[];
  isLoading: boolean;
}

const TopLogTypes: React.FC<TopLogTypesProps> = ({ data, isLoading }) => {
  // Calculate the maximum count for scaling
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-[320px] flex flex-col">
      <div className="flex items-center mb-4">
        <BarChart className="h-5 w-5 text-blue-400 mr-2" />
        <h2 className="text-white font-medium">Top Log Types</h2>
      </div>

      {isLoading && data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">
            Loading top log types...
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          No log types available.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-gray-300 text-sm mr-2 w-5 text-right font-medium">
                      {index + 1}.
                    </span>
                    <span className="text-white text-sm font-medium truncate">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm flex-shrink-0 ml-2">
                    {item.count}
                  </span>
                </div>
                <div className="h-6 bg-gray-700 rounded-md overflow-hidden relative">
                  <div
                    className={`h-full ${getSeverityBgColor(
                      item.severity
                    )} transition-all duration-500 ease-out group-hover:brightness-110`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-medium text-white truncate">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopLogTypes;
