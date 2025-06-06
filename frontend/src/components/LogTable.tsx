import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  FileDown,
  List,
} from "lucide-react";
import { LogEntry } from "../types";
import {
  formatDateTime,
  formatTimeAgo,
  getSeverityColor,
  truncateText,
} from "../utils/formatters";
import { useLogStore } from "../store/logStore";
import { exportLogsAsJson, exportLogsAsCsv } from "../utils/formatters";

interface LogTableProps {
  logs: LogEntry[];
  isLoading: boolean;
}

const LogTable: React.FC<LogTableProps> = ({ logs, isLoading }) => {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);

  const { setSelectedLog } = useLogStore();

  const columnHelper = createColumnHelper<LogEntry>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("timestamp", {
        header: "Time",
        cell: (info) => (
          <div>
            <div className="text-xs text-white">
              {formatDateTime(info.getValue())}
            </div>
            <div className="text-xs text-gray-500">
              {formatTimeAgo(info.getValue())}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("severity", {
        header: "Severity",
        cell: (info) => (
          <div
            className={`px-2 py-1 rounded text-xs font-medium inline-block ${getSeverityColor(
              info.getValue()
            )}`}
          >
            {info.getValue().toUpperCase()}
          </div>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => <div className="text-white">{info.getValue()}</div>,
      }),
      columnHelper.accessor("message", {
        header: "Message",
        cell: (info) => (
          <div className="text-gray-300">
            {truncateText(info.getValue(), 60)}
          </div>
        ),
      }),
      columnHelper.accessor("machine", {
        header: "Machine",
        cell: (info) => (
          <div className="text-gray-400 text-sm">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("applicationName", {
        header: "Application",
        cell: (info) => (
          <div className="text-gray-400 text-sm">{info.getValue() || "-"}</div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <button
            className="text-blue-400 hover:text-blue-300 transition-colors"
            onClick={() => setSelectedLog(info.row.original)}
          >
            View
          </button>
        ),
      }),
    ],
    [setSelectedLog]
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <List className="h-5 w-5 text-blue-400 mr-2" />
          <h2 className="text-white font-medium">Log Entries</h2>
          <span className="ml-2 text-sm text-gray-400">
            ({logs.length} logs)
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => exportLogsAsJson(logs)}
            className="flex items-center text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
            disabled={logs.length === 0}
          >
            <FileDown className="h-3 w-3 mr-1" />
            Export JSON
          </button>
          <button
            onClick={() => exportLogsAsCsv(logs)}
            className="flex items-center text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
            disabled={logs.length === 0}
          >
            <FileDown className="h-3 w-3 mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading && logs.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading logs...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <AlertOctagon className="h-10 w-10 mb-2" />
          <p>No logs found matching the current filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {{
                            asc: <ChevronUp className="ml-1 h-4 w-4" />,
                            desc: <ChevronDown className="ml-1 h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogTable;
