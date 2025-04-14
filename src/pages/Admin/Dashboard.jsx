import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../layouts/layout';
import AdminOrders from '../../components/AdminOrders';
import AdminPerformance from '../../components/AdminPerformance';
import AdminPhotos from '../../components/AdminPhotos';
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
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Your content */}
                {/* First line: 5 horizontal cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <div className="flex justify-center mb-2">
                            <div className="bg-blue-100 p-4 rounded-full">
                                <CubeIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 flex justify-center">New</h3>
                        <p className="font-semibold text-lg flex justify-center">{stats?.newOrders || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <div className="flex justify-center mb-2">
                            <div className="bg-lime-100 p-4 rounded-full">
                                <CubeIcon className="h-6 w-6 text-lime-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 flex justify-center">Picking</h3>
                        <p className="font-semibold text-lg flex justify-center">{stats?.pickingOrders || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <div className="flex justify-center mb-2">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 flex justify-center">Picked</h3>
                        <p className="font-semibold text-lg flex justify-center">{stats?.pickedOrders || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <div className="flex justify-center mb-2">
                            <div className="bg-orange-100 p-4 rounded-full">
                                <ClockIcon className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 flex justify-center">Packing</h3>
                        <p className="font-semibold text-lg flex justify-center">{stats?.packingOrders || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <div className="flex justify-center mb-2">
                            <div className="bg-orange-100 p-4 rounded-full">
                                <TruckIcon className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 flex justify-center">Packed</h3>
                        <p className="font-semibold text-lg flex justify-center">{stats?.packeOrders || 0}</p>
                    </div>
                </div>
                
                {/*Tab Bar*/}
                <div className="flex space-x-1 mb-3">
                    <button
                        onClick={() => setActiveTab(0)}
                        className={`flex-auto p-2 px-4 rounded-sm ${activeTab === 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab(1)}
                        className={`flex-auto p-2 px-4 rounded-sm ${activeTab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setActiveTab(2)}
                        className={`flex-auto p-2 px-4 rounded-sm ${activeTab === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                    >
                        Order Photos
                    </button>
                </div>
                {/* Third line: More content */}
                {activeTab === 0 && (
                    <AdminOrders />
                )}
                {activeTab === 1 && (
                    <AdminPerformance />
                )}
                {activeTab === 2 && (
                    <AdminPhotos />
                )}
            </div>
        </Layout>
    );
};

export default AdminPage;