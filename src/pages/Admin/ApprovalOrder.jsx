import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef} from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Layout from '../../layouts/layout';

const ApprovalOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [lineItems, setLineItems] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchOrder = async () => {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/getApprovalOrder/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setOrder(res?.data || null);
          setLineItems(res?.data?.lineItems);
        };
        fetchOrder();
    }, [id]);

    const handleApprove = (item) => {
        setLineItems(prev =>
          prev.map(li =>
            li.variantId === item.variantId ? { ...li, approved: true } : li
          )
        );
    };

    const approveOrder = async () => {
        try {
          //await axios.post(`/api/orders/${order._id}/approve`);
          toast.success("Order approved successfully!");
          navigate('/admin/approval');
        } catch (err) {
          console.error(err);
          toast.error("Failed to approve order.");
        }
    };

    if (!order) return <div>Loading...</div>;

    return (
        <Layout headerTitle={"Approve Order"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white p-4 rounded-md shadow-md">
                    <div className="flex flex-row mb-6 justify-between">
                        <h3 className="font-semibold text-xl">Order: {order?.name}</h3>
                        <button
                        onClick={() => navigate(`/admin/approval`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                        Back to Dashboard
                        </button>
                    </div>

                    <div className="flex flex-row mb-6 justify-between">
                        <p>
                        Customer:
                        <span className="font-mono text-sm text-gray-600 ml-2">
                            {order?.customer?.first_name} {order?.customer?.last_name}
                        </span>
                        </p>
                        <div className="bg-green-400 text-white text-sm px-3 py-1 rounded-xl">
                        {lineItems.filter(item => item.subbed || item.refund).length} items
                        </div>
                    </div>

                    <p className="mb-6 text-gray-700">
                        You’re viewing items that were <strong>refunded</strong> or <strong>substituted</strong>. Please review and take action.
                    </p>

                    <div className="flex flex-col gap-6">
                        {lineItems
                        .filter(item => item.subbed || item.refund)
                        .map(lineItem => (
                            <div
                            key={lineItem.variantId}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50"
                            >
                            {/* Image */}
                            <img
                                src={lineItem?.image}
                                alt={lineItem?.productTitle}
                                className="w-full h-auto max-h-48 object-contain rounded"
                            />

                            {/* Item Info */}
                            <div className="col-span-2 space-y-2">
                                <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {lineItem?.variantInfo?.title === "Default Title"
                                    ? lineItem?.productTitle
                                    : lineItem?.variantInfo?.title}
                                </h3>
                                <div className="flex gap-2">
                                    {lineItem.refund && (
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md">
                                        Refunded
                                    </span>
                                    )}
                                    {lineItem.subbed && (
                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-md">
                                        Subbed
                                    </span>
                                    )}
                                </div>
                                </div>

                                <p className="text-sm text-gray-600 font-medium">
                                SKU: {lineItem?.variantInfo?.sku}
                                </p>

                                <p className="text-sm font-semibold">
                                Quantity: {lineItem?.quantity} units
                                </p>

                                {lineItem.adminNote && (
                                <p className="text-sm text-red-600">Admin: {lineItem.adminNote}</p>
                                )}
                                {lineItem.customerNote && (
                                <p className="text-sm text-blue-600">Customer: {lineItem.customerNote}</p>
                                )}

                                {/* Action buttons */}
                                <div className="mt-3 flex gap-2">
                                    {lineItem.approved ? (
                                        <span className="text-green-600 text-sm font-semibold">✅ Approved</span>
                                        ) : (
                                        <button
                                            onClick={() => handleApprove(lineItem)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm"
                                        >
                                            Approve
                                        </button>
                                    )}
                                </div>
                            </div>
                            </div>
                        ))}
                    </div>

                    {lineItems.every(item => item.approved) && (
                        <div className="mt-6 flex justify-end">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                onClick={approveOrder}
                            >
                            Finalize Order Approval
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default ApprovalOrder;