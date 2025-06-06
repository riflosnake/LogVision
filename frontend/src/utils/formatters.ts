import { format, formatDistanceToNow } from "date-fns";
import { LogEntry, LogSeverity } from "../types";

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "yyyy-MM-dd HH:mm:ss.SSS");
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatChartTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "HH:mm:ss");
}

export function getSeverityColor(severity: LogSeverity): string {
  switch (severity) {
    case "Error":
      return "text-red-500";
    case "Warning":
      return "text-amber-500";
    case "Information":
      return "text-blue-500";
    case "Debug":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
}

export function getSeverityBgColor(severity: LogSeverity): string {
  switch (severity) {
    case "Error":
      return "bg-red-500";
    case "Warning":
      return "bg-amber-500";
    case "Information":
      return "bg-blue-500";
    case "Debug":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function exportLogsAsJson(logs: LogEntry[]): void {
  const dataStr = JSON.stringify(logs, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `logs-export-${format(
    new Date(),
    "yyyy-MM-dd-HH-mm-ss"
  )}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

export function exportLogsAsCsv(logs: LogEntry[]): void {
  if (logs.length === 0) return;

  // Get headers from the first log entry
  const headers = Object.keys(logs[0]);

  // Create CSV content
  let csvContent = headers.join(",") + "\n";

  logs.forEach((log) => {
    const row = headers.map((header) => {
      const value = log[header as keyof LogEntry];
      const cellValue =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : value;

      const escaped = String(cellValue).replace(/"/g, '""');
      return `"${escaped}"`;
    });

    csvContent += row.join(",") + "\n";
  });

  const dataUri =
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);

  const exportFileDefaultName = `logs-export-${format(
    new Date(),
    "yyyy-MM-dd-HH-mm-ss"
  )}.csv`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}
