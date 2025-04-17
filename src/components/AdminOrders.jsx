import React, { useEffect, useState } from 'react';
import axios from 'axios';
import statusColorMap from '../utils/statusColorMap';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Function to fetch orders from API
        const token = localStorage.getItem("token");
        
        console.log(`${import.meta.env.VITE_API_URL}/admin/getOrders`);
        const fetchOrders = async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/getOrders`, { headers: { Authorization: `Bearer ${token}` } });
            console.log(res?.data);
            setOrders(res?.data || []);
          } catch (err) {
            console.error('Failed to fetch orders:', err);
          }
        };
    
        fetchOrders(); // Call the function on page load
    }, []); // Empty dependency array = run once on mount

    return (
        <>
            {/* Second line: Search input and button */}
            <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
                <input
                    type="text"
                    placeholder="Search orders by number or customer name"
                    className="border rounded-md p-2 w-full mb-4 sm:mb-0"
                />
                <button className="bg-blue-500 text-white px-4 rounded-md hover:bg-blue-600 w-full sm:w-auto">
                    Search
                </button>
            </div>
            {orders.length > 0 && 
                <div className="grid grid-cols-1 gap-4">
                    {orders?.map(order => (
                        <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900">Order #{order.shopifyOrderId}</h3>
                                <span
                                className={`text-xs px-2 py-1 rounded-full ${statusColorMap[order.status] || 'bg-gray-100 text-gray-800'}`}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Customer: </p>
                                <span className="font-mono text-sm text-gray-500">{order.customer.first_name} {order.customer.last_name}</span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Items: </p>
                                <span className="font-mono text-sm text-gray-500">{order.lineItemCount}</span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Picker: </p>
                                <span className="font-mono text-sm text-gray-500">{order?.picker?.name}</span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Packer: </p>
                                <span className="font-mono text-sm text-gray-500">{order?.packer?.name}</span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Routes: </p>
                                <span className="font-mono text-sm text-gray-500"></span>
                            </div>
                        </div>
                    ))}
                </div>
            }
            
        </>
    );
};

export default AdminOrders;