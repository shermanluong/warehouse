import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import statusColorMap from '../../utils/statusColorMap';
import Layout from '../../layouts/layout';
import 'react-datepicker/dist/react-datepicker.css';


const ApprovalPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/getApprovalOrders`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                    }
                }
            );

            console.log(res?.data?.orders);
            setOrders(res?.data?.orders || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    return (
        <Layout headerTitle={"Dashboard"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {orders?.length > 0 &&
                    <div className="grid grid-cols-1 gap-4">
                        {orders.map(order => (
                            <div key={order?._id} className="bg-white p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-start relative">
                                    <div className="flex">
                                        <h3 className="text-2xl font-bold text-gray-900 mr-2">Order {order?.name}</h3>
                                        <span className={`text-lg px-2 rounded-full ${statusColorMap[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            
                                <div className="flex justify-between mt-1">
                                <p className="text-md text-gray-900">Customer:</p>
                                <span className="text-md text-gray-900">
                                    {order.customer.first_name} {order.customer.last_name}
                                </span>
                                </div>
                                <div className="flex justify-between mt-1">
                                <p className="text-md text-gray-900">Items:</p>
                                <span className="text-sm text-gray-900">{order.lineItemCount}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                <p className="text-md text-gray-900">Picker:</p>
                                <span className="text-md text-gray-900">{order?.picker?.name}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                <p className="text-md text-gray-900">Packer:</p>
                                <span className="text-md text-gray-900">{order?.packer?.name}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                <p className="text-md text-gray-900">Routes:</p>
                                <span className="text-md text-gray-900">{order?.delivery?.tripId}({order?.delivery?.driverName})</span>
                                </div>

                                { false && 
                                    <>
                                        <div className="flex justify-between mt-1">
                                        <p className="text-md text-gray-900">Start Time: </p>
                                        <span className="text-md text-gray-900">{order?.delivery?.startTime}</span>
                                        </div>

                                        <div className="flex justify-between mt-1">
                                        <p className="text-md text-gray-900">Stop Number</p>
                                        <span className="text-md text-gray-900">{order?.delivery?.stopNumber}</span>
                                        </div>
                                    </>
                                }
                                
                                {order.adminNote && (
                                    <div className="mt-1">
                                        <p className="text-md text-red-600">Admin Note: {order.adminNote}</p>
                                    </div>
                                )}
                            
                                {order.orderNote && (
                                    <div className="mt-1">
                                        <p className="text-md text-red-600">Customer Note: {order.orderNote}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                }

                {orders?.length == 0 && 
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        No data.
                    </div>
                }
            </div>
        </Layout>
    );
};

export default ApprovalPage;