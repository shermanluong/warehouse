import Layout from "../../layouts/layout"
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch orders from API
    const token = localStorage.getItem("token");

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
        console.log(res?.data);
        setOrders(res?.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      }
    };

    fetchOrders(); // Call the function on page load
  }, []); // Empty dependency array = run once on mount

  if (loading) return <div>Loading orders...</div>;

  return (
    <Layout headerTitle={"Orders"}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Your content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key = {order._id} className="bg-white border border-gray-200 rounded-x1 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">Order #{order.shopifyOrderId}</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    3 items
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Customer: <span className="font-mono">d3k R72</span></p>
                </div>
                {/* Progress Bar for Substitution */}
                <div className="mt-4 mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>33%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-300 h-2 rounded-full" 
                      style={{ width: '33%' }}
                    ></div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm">
                    Start Picking
                  </button>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </Layout>
  )
}
