'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function AdminControls({ onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setMessage(null);
      await api.refreshContainers();
      setMessage({ type: 'success', text: 'Container data refreshed successfully' });
      if (onRefresh) onRefresh();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to refresh container data' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!confirm('Are you sure you want to delete all container history? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setMessage(null);
      await api.deleteHistory();
      setMessage({ type: 'success', text: 'Container history deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete container history' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Admin Controls</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Container Data'}
        </button>
        
        <button
          onClick={handleDeleteHistory}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete Container History'}
        </button>
      </div>
    </div>
  );
}