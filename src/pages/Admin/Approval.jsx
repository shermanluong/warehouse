import React, { useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../layouts/layout';
import 'react-datepicker/dist/react-datepicker.css';
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

const ApprovalPage = () => {
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
        <Layout headerTitle={"Approve"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {orders?.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => {
                    const pendingItems = order.lineItems.filter(item => !item.approval).length;

                    return (
                        <div key={order?._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                        <div className="flex justify-between items-start">
                            <Link
                            to={`/admin/approval/${order?._id}`}
                            className="hover:text-blue-700 text-blue-600 cursor-pointer"
                            >
                            <h3 className="text-2xl font-semibold underline">
                                Order {order?.name}
                            </h3>
                            </Link>

                            {pendingItems > 0 ? (
                            <span className="flex items-center text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                {pendingItems} item(s) need approval
                            </span>
                            ) : (
                            <span className="flex items-center text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                All items approved
                            </span>
                            )}
                        </div>

                        <div className="mt-4 space-y-2 text-gray-800 text-sm">
                            <div className="flex justify-between">
                            <span className="font-medium">Customer:</span>
                            <span>{order.customer.first_name} {order.customer.last_name}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="font-medium">Total Items:</span>
                            <span>{order.lineItems.length}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="font-medium">Picker:</span>
                            <span>{order?.picker?.name || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="font-medium">Packer:</span>
                            <span>{order?.packer?.name || "—"}</span>
                            </div>

                            {order.adminNote && (
                            <div className="text-red-600 mt-2">📝 Admin Note: {order.adminNote}</div>
                            )}

                            {order.orderNote && (
                            <div className="text-blue-600 mt-1">📦 Customer Note: {order.orderNote}</div>
                            )}
                        </div>
                        </div>
                    );
                    })}
                </div>
                ) : (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600 text-lg">
                    No orders pending.
                </div>
                )}
            </div>
        </Layout>
    );
};

export default ApprovalPage;