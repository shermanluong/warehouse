import React, { useState } from 'react';
import Layout from '../../layouts/layout';
import AdminOrders from '../../components/AdminOrders';
import AdminPerformance from '../../components/AdminPerformance';
import AdminPhotos from '../../components/AdminPhotos';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Layout headerTitle={"Dashboard"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Your content */}
                {/* First line: 5 horizontal cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <h3 className="text-gray-600 flex justify-center">New</h3>
                        <p className="font-semibold text-lg flex justify-center">10</p>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <h3 className="text-gray-600 flex justify-center">Picking</h3>
                        <p className="font-semibold text-lg flex justify-center">0</p>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <h3 className="text-gray-600 flex justify-center">Picked</h3>
                        <p className="font-semibold text-lg flex justify-center">0</p>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <h3 className="text-gray-600 flex justify-center">Packing</h3>
                        <p className="font-semibold text-lg flex justify-center">10</p>
                    </div>

                    <div className="bg-white p-4 rounded-sm shadow-md">
                        <h3 className="text-gray-600 flex justify-center">Packed</h3>
                        <p className="font-semibold text-lg flex justify-center">10</p>
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