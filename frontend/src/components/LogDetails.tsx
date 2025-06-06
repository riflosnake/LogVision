import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLogStore } from '../store/logStore';
import { formatDateTime, getSeverityColor } from '../utils/formatters';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const LogDetails: React.FC = () => {
  const { selectedLog, setSelectedLog } = useLogStore();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (selectedLog) {
      setIsVisible(true);
    }
  }, [selectedLog]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setSelectedLog(null);
    }, 300); // Wait for animation to complete before removing data
  };
  
  if (!selectedLog) {
    return null;
  }
  
  return (
    <div 
      className={`fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-8'
        }`}
      >
        <div className="flex items-center justify-between bg-gray-900 px-6 py-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${getSeverityColor(selectedLog.severity).replace('text-', 'bg-')}`}></div>
            <h2 className="text-lg font-medium text-white">Log Details</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left column - basic info */}
            <div>
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-500 mb-1">Message</h3>
                <p className="text-white text-sm">{selectedLog.message}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-500 mb-1">Type</h3>
                <p className="text-white font-medium">{selectedLog.type}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-500 mb-1">Severity</h3>
                <div className={`inline-block px-2 py-1 rounded ${getSeverityColor(selectedLog.severity)}`}>
                  {selectedLog.severity.toUpperCase()}
                </div>
              </div>
            </div>
            
            {/* Right column - metadata */}
            <div>
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-500 mb-1">Timestamp</h3>
                <p className="text-white">{formatDateTime(selectedLog.timestamp)}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-500 mb-1">Machine</h3>
                <p className="text-white">{selectedLog.machine}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-500 mb-1">Application</h3>
                <p className="text-white">{selectedLog.applicationName || '-'}</p>
              </div>
              
              {selectedLog.source && (
                <div className="mb-4">
                  <h3 className="text-xs uppercase text-gray-500 mb-1">Source</h3>
                  <p className="text-white">{selectedLog.source}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Stack Trace */}
          <div>
            <h3 className="text-xs uppercase text-gray-500 mb-2">Stack Trace</h3>
            <div className="bg-gray-900 rounded-md overflow-hidden">
              <SyntaxHighlighter
                language="csharp"
                style={atomOneDark}
                customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem', borderRadius: '0.375rem' }}
              >
                {selectedLog.stackTrace}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 px-6 py-4 flex justify-end">
          <button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetails;