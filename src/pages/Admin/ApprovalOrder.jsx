import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef} from 'react';
import { 
    PencilIcon
} from '@heroicons/react/24/outline'
import NoteDialog from '../../components/NoteDialog'
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
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setOrder(res?.data || null);
          setLineItems(res?.data?.lineItems);
          console.log(res?.data);
        };
        fetchOrder();
    }, [id]);

    const [showDialog, setShowDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const openNoteDialog = (item) => {
        setSelectedItem(item);
        setShowDialog(true);
    };

    const handleNoteSubmit = async ({ note }) => {
        try {
          console.log(note);
      
          const res = await axios.patch(
            `${import.meta.env.VITE_API_URL}/admin/order/${order._id}/add-item-note`,
            {
              productId: selectedItem.productId,
              note: note,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
      
          const updatedItem = res.data.item;
      
          // Update the matching line item by productId
          setLineItems(prevItems =>
            prevItems.map(item =>
              item.productId === selectedItem.productId
                ? { ...item, flags: updatedItem?.flags }
                : item
            )
          );
        } catch (error) {
          console.error("Failed to submit product note:", error);
          alert("Error submitting product note. Please try again.");
        }
    };

    if (!order) return <div>Loading...</div>;

    return (
        <Layout headerTitle={"Order Detail"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white p-4 rounded-sm shadow-md">
                    <div className="flex flex-row mb-4 justify-between">
                        <h3 className="font-semibold text-xl">Order: #{order?.shopifyOrderId}</h3>
                        <button 
                            onClick={() => navigate(`/admin/dashboard`)}
                            className="px-4 rounded-md hover:bg-blue-300"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                    <div className="flex flex-row mb-4 justify-between">
                        <p>Customer: 
                            <span className="font-mono text-sm text-gray-500 ml-2">
                                {order?.customer?.first_name} {order?.customer?.last_name}
                            </span>
                        </p>
                        <div className="bg-green-400 text-sm px-2 rounded-xl">{order.lineItems.length} items</div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {lineItems.map((lineItem) => (
                            <div
                                key={lineItem.variantId}
                                className="flex flex-col sm:flex-row justify-between border border-gray-200 rounded-lg p-4 shadow-md"
                            >
                                {/* Left side: image + name + SKU */}
                                <div className="flex items-start">
                                    <img
                                        src={lineItem?.image}
                                        alt={lineItem?.productTitle}
                                        className="w-36 h-36 rounded object-cover"
                                    />
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {lineItem?.variantInfo?.title === "Default Title"
                                                ? lineItem?.productTitle
                                                : lineItem?.variantInfo?.title}
                                            {(lineItem.adminNote || lineItem.customerNote) && (
                                                <span title="This item has notes" className="text-yellow-500 ml-2">📌</span>
                                            )}
                                        </h3>
                                        <p className="font-semibold text-sm text-gray-900">SKU: {lineItem?.variantInfo?.sku}</p>
                                        <span className="font-semibold text-sm text-gray-900">
                                            {lineItem?.quantity} units
                                        </span>
                                        {/* Notes Display */}
                                        {lineItem.adminNote && (
                                        <p className="text-xs text-red-600 mt-1">Admin: {lineItem.adminNote}</p>
                                        )}
                                        {lineItem.customerNote && (
                                        <p className="text-xs text-blue-600 mt-1">Customer: {lineItem.customerNote}</p>
                                        )}
                                    </div>
                                </div>
                          
                                {/* Right side: picked info + buttons */}
                                {!lineItem.picked && !lineItem.flags.length >  0 && (
                                    <div className="flex mt-4 space-x-3 sm:flex-col sm:items-start sm:mt-0 sm:space-x-0 sm:space-y-2 ">
                                        <button 
                                            onClick={() => openNoteDialog(lineItem)}
                                            className="hover:bg-gray-100 w-10 h-10 rounded flex items-center justify-center"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {showDialog && selectedItem && (
                <NoteDialog
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                    onSubmit={handleNoteSubmit}
                />
            )}
        </Layout>
    )
}

export default ApprovalOrder;