# LogVision

**LogVision** is a powerful web application built with React (TypeScript) and .NET that visualizes logs from various sources, enabling developers and teams to analyze and monitor application events with ease.

---

## 🚀 Features

- **Flexible Log Visualization:** Dynamic support for multiple log table structures and custom columns.
- **Advanced Filtering:** Filter logs by severity, date range, search terms, and pagination.
- **Time Series Charts:** Visualize log frequency and severity trends over time.
- **Caching:** Backend caching for improved performance.
- **Extensible Configuration:** Customize log table mappings via appsettings without code changes.
- **Modern Tech Stack:** React + TypeScript frontend paired with a .NET backend API.

---

## 📦 Tech Stack

| Frontend                 | Backend                      |
|-------------------------|------------------------------|
| React                   | .NET 9             |
| TypeScript              | C#                          |
| Fetch (for API calls)   | Dapper (SQL micro-ORM)       |
| Chart.js or similar     | Microsoft.Data.SqlClient     |

---

## ⚙️ Getting Started

### Prerequisites

- Docker (to run with Docker Compose), or  
- .NET 9 and Node.js with npm (to run backend and frontend individually)  
- SQL Server (remote or local instance)

---

### Backend Setup

1. Configure your database connection in `appsettings.json`:

You should replace the values of corresponding keys, to match your database log table.

```json
{
  "ConnectionStrings": {
    "Database": "Server=YOUR_SERVER;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASSWORD;"
  },
  "LogOptions": {
    "TableName": "YourTableName",
    "Columns": {
      "Id": "YourIdColumn",
      "Timestamp": "YourTimestampColumn",
      "Message": "YourMessageColumn",
      "Title": "YourTitleColumn",
      "Severity": "YourSeverityColumn",
      "Machine": "YourMachineNameColumn",
      "StackTrace": "YourStackTraceColumn",
      "ApplicationName": "YourApplicationNameColumn",
      "Source": "YourSourceColumn"
    },
    "SeverityValues": {
      "error": "Error",
      "warn": "Warning",
      "info": "Information",
      "debug": "Debug"
    }
  }
}
