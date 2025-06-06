import React from 'react';
import { AlertCircle, Clock, PauseCircle, PlayCircle, RefreshCw, Settings } from 'lucide-react';
import { useLogStore } from '../store/logStore';

interface HeaderProps {
  onRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  const { isPaused, setIsPaused, chartFilters, isLoading } = useLogStore();
  
  return (
    <header className="bg-gray-900 text-white py-3 px-6 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-7 w-7 text-red-500" />
          <h1 className="text-xl font-bold tracking-tight">LogVision Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <div className="flex items-center bg-gray-800 px-3 py-1.5 rounded-md">
            <Clock className="h-4 w-4 mr-2 text-blue-400" />
            <span>Last {chartFilters.timeRange} minutes</span>
          </div>
          
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
              isPaused ? 'bg-green-700 hover:bg-green-600' : 'bg-amber-700 hover:bg-amber-600'
            }`}
          >
            {isPaused ? (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <PauseCircle className="h-4 w-4 mr-2" />
                <span>Pause</span>
              </>
            )}
          </button>
          
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;