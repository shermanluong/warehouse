import Layout from "../../layouts/layout";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Function to fetch orders from API
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/packer/orders`, { headers: { Authorization: `Bearer ${token}` } });
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

  const handleStart = async (order) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/packer/startPacking/${order._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate(`/packer/order/${order._id}`);
      } catch (err) {
        console.error("Failed to start packing:", err);
        alert("Error: Unable to start packing.");
      }
  }

  if (loading) return <div>Loading orders...</div>;

  return (
    <Layout headerTitle={"Orders"}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Your content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {orders?.map(order => (
            <div key = {order._id} className="bg-white border border-gray-200 rounded-x1 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900">
                    Order {order?.name}
                    {(order?.orderNote || order?.adminNote) && (
                      <span title="This order has notes" className="text-yellow-500 ml-2">📌</span>
                    )}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {order.lineItemCount} items
                  </span>
                </div>

                <div className="mt-2 mb-4 flex justify-between">
                  <p className="text-sm text-gray-500">Customer: </p>
                  <span className="font-mono text-sm text-gray-500">
                    {order.customer?.first_name} {order.customer?.last_name}
                  </span>
                </div>
                <span className="bg-green-100 text-green-800 border border-green-600 text-xs px-2 py-1 rounded-full">
                  ✓ 0
                </span>
                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() =>handleStart(order)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm">
                    Start Packing
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
