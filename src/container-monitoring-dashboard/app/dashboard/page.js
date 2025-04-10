'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

// Components
import Header from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContainerList from '@/components/dashboard/ContainerList';
import StatsOverview from '@/components/dashboard/StatsOverview';
import AdminControls from '@/components/layout/AdminControls';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchContainers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getContainers();
      setContainers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch container data');
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

    if (user) {
      fetchContainers();
      // Set up interval to refresh data every 30 seconds
      const interval = setInterval(fetchContainers, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #98D8EF, #EAE2C6)' }}>
        <div className="text-gray-800 text-xl">Loading...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(to bottom right, #98D8EF, #EAE2C6)' }}>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        
        {error && (
          <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all hover:scale-[1.01]">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-blue-600">Loading data...</div>
              </div>
            ) : (
              <StatsOverview containers={containers} />
            )}
            {user.role === 'admin' && <AdminControls onRefresh={fetchContainers} />}
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-4" style={{ color: "#6a7282" }}>Resource Usage by Container</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-blue-600">Loading containers...</div>
              </div>
            ) : (
              <ContainerList containers={containers} />
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard/history')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            View Historical Data
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}