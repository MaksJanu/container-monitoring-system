'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import ContainerList from '@/components/dashboard/ContainerList';
import StatsOverview from '@/components/dashboard/StatsOverview';
import Header from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
      // Set up interval to refresh data every minute
      const interval = setInterval(fetchContainers, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-800 to-indigo-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Container Monitoring Dashboard</h1>
        
        {error && (
          <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {user.role === 'admin' && <AdminControls onRefresh={fetchContainers} />}
        
        <StatsOverview containers={containers} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Active Containers</h2>
          {isLoading ? (
            <div className="text-white">Loading container data...</div>
          ) : (
            <ContainerList containers={containers} />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}