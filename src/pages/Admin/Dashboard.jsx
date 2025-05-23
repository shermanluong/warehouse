import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../layouts/layout';
import AdminOrders from '../../components/admin/AdminOrders';
import AdminPerformance from '../../components/admin/AdminPerformance';
import AdminPhotos from '../../components/admin/AdminPhotos';
import {
    CubeIcon,
    CheckCircleIcon,
    ClockIcon,
    TruckIcon
  } from '@heroicons/react/24/outline';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Function to fetch orders from API
        const token = localStorage.getItem("token");
    
        const fetechStats = async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
            console.log(res?.data);
            setStats(res?.data || null);
          } catch (err) {
            console.error('Failed to fetch stats:', err);
          }
        };
    
        fetechStats(); // Call the function on page load
    }, []); // Empty dependency array = run once on mount

    return (
        <Layout headerTitle={"Dashboard"}>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* New */}
              <div className="bg-gradient-to-tr from-sky-50 to-sky-100 p-6 rounded-2xl shadow flex flex-col items-center hover:shadow-lg transition">
                <div className="bg-sky-200 p-4 rounded-full mb-2 shadow">
                  <CubeIcon className="h-7 w-7 text-sky-600" />
                </div>
                <span className="text-gray-500 text-sm">New</span>
                <span className="font-bold text-2xl text-sky-600">{stats?.newOrders || 0}</span>
              </div>
              {/* Picking */}
              <div className="bg-gradient-to-tr from-lime-50 to-lime-100 p-6 rounded-2xl shadow flex flex-col items-center hover:shadow-lg transition">
                <div className="bg-lime-200 p-4 rounded-full mb-2 shadow">
                  <CubeIcon className="h-7 w-7 text-lime-600" />
                </div>
                <span className="text-gray-500 text-sm">Picking</span>
                <span className="font-bold text-2xl text-lime-600">{stats?.pickingOrders || 0}</span>
              </div>
              {/* Picked */}
              <div className="bg-gradient-to-tr from-green-50 to-green-100 p-6 rounded-2xl shadow flex flex-col items-center hover:shadow-lg transition">
                <div className="bg-green-200 p-4 rounded-full mb-2 shadow">
                  <CheckCircleIcon className="h-7 w-7 text-green-600" />
                </div>
                <span className="text-gray-500 text-sm">Picked</span>
                <span className="font-bold text-2xl text-green-600">{stats?.pickedOrders || 0}</span>
              </div>
              {/* Packing */}
              <div className="bg-gradient-to-tr from-yellow-50 to-orange-100 p-6 rounded-2xl shadow flex flex-col items-center hover:shadow-lg transition">
                <div className="bg-orange-200 p-4 rounded-full mb-2 shadow">
                  <ClockIcon className="h-7 w-7 text-orange-600" />
                </div>
                <span className="text-gray-500 text-sm">Packing</span>
                <span className="font-bold text-2xl text-orange-600">{stats?.packingOrders || 0}</span>
              </div>
              {/* Packed */}
              <div className="bg-gradient-to-tr from-orange-50 to-pink-100 p-6 rounded-2xl shadow flex flex-col items-center hover:shadow-lg transition">
                <div className="bg-pink-200 p-4 rounded-full mb-2 shadow">
                  <TruckIcon className="h-7 w-7 text-pink-600" />
                </div>
                <span className="text-gray-500 text-sm">Packed</span>
                <span className="font-bold text-2xl text-pink-600">{stats?.packeOrders || 0}</span>
              </div>
            </div>
      
            {/* Tab Bar */}
            <div className="flex rounded-lg overflow-hidden mb-6 bg-gray-100 shadow">
              <button
                onClick={() => setActiveTab(0)}
                className={`flex-1 px-6 py-3 font-medium transition ${
                  activeTab === 0
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 hover:bg-blue-100'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`flex-1 px-6 py-3 font-medium transition ${
                  activeTab === 1
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 hover:bg-blue-100'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`flex-1 px-6 py-3 font-medium transition ${
                  activeTab === 2
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 hover:bg-blue-100'
                }`}
              >
                Order Photos
              </button>
            </div>
      
            {/* Tab Content */}
            <div>
              {activeTab === 0 && <AdminOrders />}
              {activeTab === 1 && <AdminPerformance />}
              {activeTab === 2 && <AdminPhotos />}
            </div>
          </div>
        </Layout>
    );
};

export default AdminPage;