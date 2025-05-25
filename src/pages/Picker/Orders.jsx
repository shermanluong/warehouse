import Layout from "../../layouts/layout"
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/picker/orders`, { headers: { Authorization: `Bearer ${token}` } });
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map(order => (
            <div
              key={order._id}
              className="bg-white border-2 border-blue-100 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <h3
                    className="font-extrabold text-2xl md:text-3xl text-gray-900 flex items-center truncate max-w-[60%]"
                    title={`Order ${order.name}`}
                  >
                    Order {order.name}
                    {(order?.orderNote || order?.adminNote) && (
                      <span title="This order has notes" className="text-yellow-500 ml-3 text-2xl">📌</span>
                    )}
                  </h3>
                  <span className="bg-green-200 font-mono text-green-900 text-lg md:text-xl px-4 rounded-full shadow ml-2 truncate" title={`${order.lineItemCount} items`}>
                    {order.lineItemCount} items
                  </span>
                </div>
                <div className="flex justify-between text-base md:text-xl mb-4">
                  <span className="font-bold text-gray-700">Customer:</span>
                  <span className="font-mono text-blue-800 truncate max-w-[55%]" title={`${order.customer?.first_name} ${order.customer?.last_name}`}>
                    {order.customer?.first_name} {order.customer?.last_name}
                  </span>
                </div>
  
                {/* Progress Bar for Picking */}
                <div className="mb-4">
                  <div className="flex justify-between text-base md:text-lg font-bold text-gray-600 mb-2">
                    <span>{order?.pickedCount} / {order?.lineItemCount} picked</span>
                    <span>
                      {Math.round(order?.pickedCount * 100 / order?.lineItemCount)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                    <div
                      className="bg-green-500 h-3 md:h-4 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(order?.pickedCount * 100 / order?.lineItemCount)}%` }}
                    ></div>
                  </div>
                </div>
  
                {/* Notes, if present */}
                {order.adminNote && (
                  <div className="mb-2">
                    <p className="font-bold text-base md:text-xl text-red-700 truncate" title={order.adminNote}>Admin Note: {order.adminNote}</p>
                  </div>
                )}
                {order.orderNote && (
                  <div className="mb-2">
                    <p className="font-bold text-base md:text-xl text-blue-700 truncate" title={order.orderNote}>Customer Note: {order.orderNote}</p>
                  </div>
                )}
  
                {/* Action Button */}
                <div className="mt-auto flex">
                  <button
                    onClick={() => navigate(`/picker/order/${order._id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-800 text-white py-2 text-lg font-bold rounded-xl shadow-lg transition"
                  >
                    {Math.round(order?.pickedCount * 100 / order?.lineItemCount) > 0
                      ? "Continue"
                      : "Start Picking"
                    }
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
