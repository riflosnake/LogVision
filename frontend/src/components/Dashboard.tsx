import React from "react";
import Header from "./Header";
import ChartFilters from "./ChartFilters";
import LogFilters from "./LogFilters";
import LogChart from "./LogChart";
import TopLogTypes from "./TopLogTypes";
import LogTable from "./LogTable";
import LogDetails from "./LogDetails";
import { useLogData } from "../hooks/useLogData";
import { useLogStore } from "../store/logStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard: React.FC = () => {
  const {
    logs,
    timeSeriesData,
    topLogTypes,
    isLogsQueryLoading,
    isTimeSeriesQueryLoading,
    isTopTypesQueryLoading,
    refetchAll,
  } = useLogData();

  const { setIsPaused } = useLogStore();

  const handleRefresh = () => {
    setIsPaused(true);
    refetchAll().then(() => {
      toast.success("Data refreshed successfully!");
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header onRefresh={handleRefresh} />

      <main className="container mx-auto px-4 py-6">
        {/* Chart Filters - for charts only */}
        <div className="mb-6">
          <ChartFilters />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <LogChart
              data={timeSeriesData ?? []}
              isLoading={isTimeSeriesQueryLoading}
            />
          </div>
          <div>
            <TopLogTypes
              data={topLogTypes ?? []}
              isLoading={isTopTypesQueryLoading}
            />
          </div>
        </div>

        {/* Log Table Filters - for table only */}
        <div className="mb-6">
          <LogFilters />
        </div>

        {/* Log Table */}
        <div className="mb-6">
          <LogTable logs={logs ?? []} isLoading={isLogsQueryLoading} />
        </div>
      </main>

      <LogDetails />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default Dashboard;
