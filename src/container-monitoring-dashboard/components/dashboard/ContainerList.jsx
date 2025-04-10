'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContainerList({ containers }) {
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [showFullId, setShowFullId] = useState(false);
  
  if (!containers || containers.length === 0) {
    return <div className="text-white">No containers available</div>;
  }
  
  const statusColor = (status) => {
    if (status === 'running') return 'bg-green-100 text-green-800';
    if (status === 'exited') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU Usage</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory Usage</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {containers.map((container) => (
              <tr key={container.containerId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{container.name}</div>
                  <div className="text-xs text-gray-500">{container.containerId.substring(0, 12)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(container.status)}`}>
                    {container.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{container.cpuUsage?.toFixed(2)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(container.cpuUsage || 0, 100)}%` }}></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{container.ramMemoryUsage?.toFixed(2)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-pink-600 h-2.5 rounded-full" style={{ width: `${Math.min(container.ramMemoryUsage || 0, 100)}%` }}></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedContainer(selectedContainer === container ? null : container)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {selectedContainer === container ? 'Hide Details' : 'View Details'}
                  </button>
                  <Link href={`/dashboard/history?containerId=${container.containerId}`} className="ml-4 text-green-600 hover:text-green-900">
                    History
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedContainer && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Container Details: {selectedContainer.name}</h3>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">Basic Information</h4>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="text-sm text-gray-900">
                  <span 
                    onClick={() => setShowFullId(!showFullId)}
                    className="cursor-pointer hover:text-blue-600"
                    title={showFullId ? "Click to collapse" : "Click to show full ID"}
                  >
                    {showFullId 
                      ? selectedContainer.containerId 
                      : `${selectedContainer.containerId.substring(0, 12)}...`}
                  </span>
                  {showFullId && (
                    <button 
                      className="ml-2 text-xs text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(selectedContainer.containerId);
                        alert('ID copied to clipboard!');
                      }}
                    >
                      Copy
                    </button>
                  )}
                </dd>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">{selectedContainer.status}</dd>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{new Date(selectedContainer.createdAt).toLocaleString()}</dd>
              </dl>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Resource Usage</h4>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-sm font-medium text-gray-500">CPU Usage</dt>
                <dd className="text-sm text-gray-900">{selectedContainer.cpuUsage?.toFixed(2)}%</dd>
                <dt className="text-sm font-medium text-gray-500">Memory Usage</dt>
                <dd className="text-sm text-gray-900">{selectedContainer.ramMemoryUsage?.toFixed(2)}%</dd>
                <dt className="text-sm font-medium text-gray-500">Disk I/O</dt>
                <dd className="text-sm text-gray-900">{formatBytes(selectedContainer.diskUsage || 0)}</dd>
                <dt className="text-sm font-medium text-gray-500">Network I/O</dt>
                <dd className="text-sm text-gray-900">{formatBytes(selectedContainer.networkUsage || 0)}</dd>
              </dl>
            </div>
          </div>
          
          {selectedContainer.logs && selectedContainer.logs.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700">Recent Logs</h4>
              <div className="mt-2 bg-gray-100 p-3 rounded-md h-48 text-black overflow-y-auto">
                <pre className="text-xs font-mono">
                  {selectedContainer.logs.join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}