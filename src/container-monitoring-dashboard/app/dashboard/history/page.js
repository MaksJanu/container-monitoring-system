'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ContainerHistory() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerId = searchParams.get('containerId');
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('hour');
  
  const fetchHistory = async () => {
    if (!containerId) return;
    
    try {
      setIsLoading(true);
      
      // Calculate start date based on selected time range
      const endDate = new Date();
      let startDate = new Date();
      
      if (timeRange === 'hour') {
        startDate.setHours(startDate.getHours() - 1);
      } else if (timeRange === 'day') {
        startDate.setDate(startDate.getDate() - 1);
      } else if (timeRange === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      }
      
      const data = await api.getContainerHistory({
        containerId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });
      
      setHistory(data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      setError(null);
    } catch (err) {
      setError('Failed to fetch container history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user && containerId) {
      fetchHistory();
    } else if (user && !containerId) {
      router.push('/dashboard');
    }
  }, [user, loading, containerId, timeRange, router]);
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  // Prepare data for charts
  const timestamps = history.map(h => new Date(h.timestamp).toLocaleTimeString());
  const cpuData = history.map(h => h.metrics.cpuUsage);
  const memoryData = history.map(h => h.metrics.ramMemoryUsage);
  const diskData = history.map(h => h.metrics.diskUsage);
  const networkData = history.map(h => h.metrics.networkUsage);
  
  const lineChartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: cpuData,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Memory Usage (%)',
        data: memoryData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      }
    ],
  };
  
  const ioChartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Disk I/O (bytes)',
        data: diskData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Network I/O (bytes)',
        data: networkData,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.1,
      }
    ],
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-800 to-indigo-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Container History</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
        
        {error && (
          <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Performance History</h2>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setTimeRange('hour')}
                className={`px-3 py-1 rounded ${timeRange === 'hour' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Last Hour
              </button>
              <button 
                onClick={() => setTimeRange('day')}
                className={`px-3 py-1 rounded ${timeRange === 'day' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Last Day
              </button>
              <button 
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 rounded ${timeRange === 'week' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Last Week
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">Loading history data...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">No history data available for the selected time range.</div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">CPU & Memory Usage</h3>
                <div className="h-72">
                  <Line 
                    data={lineChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Usage (%)'
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Disk & Network I/O</h3>
                <div className="h-72">
                  <Line 
                    data={ioChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Bytes'
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}