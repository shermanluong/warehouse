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
          console.log(res?.data);
          setOrder(res?.data || null);
          setLineItems(res?.data?.lineItems);
        };
        fetchOrder();
    }, [id]);

    const handleApprove = async (item) => {
        try {
          await axios.patch(
            `${import.meta.env.VITE_API_URL}/admin/order/${order._id}/item/${item.shopifyLineItemId}/approve`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
      
          setLineItems(prev =>
            prev.map(li =>
              li.shopifyLineItemId === item.shopifyLineItemId ? { ...li, approved: true } : li
            )
          );
      
          toast.success("Item approved!");
        } catch (err) {
          console.error(err);
          toast.error("Failed to approve item.");
        }
    };

    const approveOrder = async () => {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/admin/order/${order._id}/approve`,
            {}, // request body is empty in this case
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
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
                                className="grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50"
                                >
                                {/* Original Product Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                                    {/* Image - Fixed Size */}
                                    <div className="sm:col-span-2">
                                    <img
                                        src={lineItem?.image}
                                        alt={lineItem?.productTitle}
                                        className="w-full h-auto max-h-48 object-contain rounded border border-gray-200"
                                    />
                                    </div>

                                    {/* Item Info - Left Aligned */}
                                    <div className="sm:col-span-10 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {lineItem?.variantInfo?.title === "Default Title"
                                            ? lineItem?.productTitle
                                            : lineItem?.variantInfo?.title}
                                        </h3>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                                            <span>Price: ${lineItem?.variantInfo?.price}</span>
                                            <span className="hidden sm:block">•</span>
                                            <span>Qty: {lineItem?.pickedStatus.damaged.quantity + lineItem?.pickedStatus.outOfStock.quantity}</span>
                                            <span className="hidden sm:block">•</span>
                                            <span>Total: ${(lineItem?.variantInfo?.price * (lineItem?.pickedStatus.damaged.quantity + lineItem?.pickedStatus.outOfStock.quantity))?.toFixed(2)}</span>
                                        </div>
                                        </div>
                                        
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

                                    {/* Notes */}
                                    <div className="space-y-1">
                                        {lineItem.adminNote && (
                                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded text-left">Admin: {lineItem.adminNote}</p>
                                        )}
                                        {lineItem.customerNote && (
                                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded text-left">Customer: {lineItem.customerNote}</p>
                                        )}
                                    </div>

                                    {/* Action buttons - Left Aligned */}
                                    <div className="flex gap-2">
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

                                {/* Substitution Section */}
                                {lineItem?.substitution?.shopifyVariantId && (
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg items-start">
                                    {/* Substitution Image - Fixed Size */}
                                    <div className="sm:col-span-2">
                                        <img
                                        src={lineItem?.substitution?.image}
                                        alt={lineItem?.substitution?.title}
                                        className="w-full h-auto max-h-48 object-contain rounded border-2 border-yellow-300 cursor-pointer"
                                        onClick={() => OnClickImage(lineItem?.substitution?.image)}
                                        />
                                    </div>
                                    
                                    {/* Substitution Info - Left Aligned */}
                                    <div className="sm:col-span-10 space-y-2">
                                        <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-yellow-800">
                                            Substitution: {lineItem?.substitution?.title}
                                            </h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 mt-1">
                                            <span>SKU: {lineItem?.substitution?.sku}</span>
                                            <span className="hidden sm:block">•</span>
                                            <span>Price: ${lineItem?.substitution?.price}</span>
                                            </div>
                                        </div>
                                        <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-md">
                                            Substituted
                                        </span>
                                        </div>

                                        {/* Substitution Note */}
                                        {lineItem.substitutionNote && (
                                        <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded text-left">
                                            Note: {lineItem.substitutionNote}
                                        </p>
                                        )}
                                    </div>
                                    </div>
                                )}
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