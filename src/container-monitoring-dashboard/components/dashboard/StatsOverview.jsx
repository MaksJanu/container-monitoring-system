'use client';

import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

export default function StatsOverview({ containers }) {
  const [statsData, setStatsData] = useState({
    activeContainers: 0,
    stoppedContainers: 0,
    avgCpuUsage: 0,
    avgMemoryUsage: 0
  });

  useEffect(() => {
    if (containers.length === 0) return;

    const active = containers.filter(c => c.status === 'running').length;
    const stopped = containers.length - active;
    
    const cpuValues = containers.map(c => c.cpuUsage).filter(Boolean);
    const memValues = containers.map(c => c.ramMemoryUsage).filter(Boolean);
    
    const avgCpu = cpuValues.length ? cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length : 0;
    const avgMem = memValues.length ? memValues.reduce((a, b) => a + b, 0) / memValues.length : 0;
    
    setStatsData({
      activeContainers: active,
      stoppedContainers: stopped,
      avgCpuUsage: avgCpu.toFixed(2),
      avgMemoryUsage: avgMem.toFixed(2)
    });
  }, [containers]);

  const statusData = {
    labels: ['Running', 'Stopped'],
    datasets: [
      {
        data: [statsData.activeContainers, statsData.stoppedContainers],
        backgroundColor: ['#4ade80', '#f87171'],
        borderColor: ['#22c55e', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const resourceData = {
    labels: containers.map(c => c.name.substring(0, 10) + (c.name.length > 10 ? '...' : '')),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: containers.map(c => c.cpuUsage),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Memory Usage (%)',
        data: containers.map(c => c.ramMemoryUsage),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#6a7282" }}>Container Status</h3>
        <div className="h-64 flex items-center justify-center">
          <Doughnut 
            data={statusData} 
            options={{ 
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#6a7282'
                  }
                }
              }
            }} 
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="bg-green-100 p-3 rounded">
            <p className="text-sm" style={{ color: "#6a7282" }}>Running</p>
            <p className="text-xl font-bold text-green-600">{statsData.activeContainers}</p>
          </div>
          <div className="bg-red-100 p-3 rounded">
            <p className="text-sm" style={{ color: "#6a7282" }}>Stopped</p>
            <p className="text-xl font-bold text-red-600">{statsData.stoppedContainers}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#6a7282" }}>Resource Usage by Container</h3>
        <div className="h-64">
          <Bar
            data={resourceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Usage (%)',
                    color: '#6a7282'
                  },
                  ticks: {
                    color: '#6a7282'
                  }
                },
                x: {
                  ticks: {
                    color: '#6a7282'
                  }
                }
              },
              plugins: {
                legend: {
                  labels: {
                    color: '#6a7282'
                  }
                }
              }
            }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-100 p-3 rounded">
            <p className="text-sm" style={{ color: "#6a7282" }}>Avg CPU Usage</p>
            <p className="text-xl font-bold text-blue-600">{statsData.avgCpuUsage}%</p>
          </div>
          <div className="bg-pink-100 p-3 rounded">
            <p className="text-sm" style={{ color: "#6a7282" }}>Avg Memory Usage</p>
            <p className="text-xl font-bold text-pink-600">{statsData.avgMemoryUsage}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}