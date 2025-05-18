import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef} from 'react';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { 
    PencilIcon
} from '@heroicons/react/24/outline'
import NoteDialog from '../../components/NoteDialog'
import axios from 'axios';
import Layout from '../../layouts/layout';

const Order = () => {
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
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              {/* Header */}
              <div className="flex flex-col sm:flex-row mb-6 justify-between items-start sm:items-center">
                <h3 className="font-semibold text-2xl text-gray-800 mb-2 sm:mb-0">
                  Order: <span className="text-blue-600">#{order?.shopifyOrderId}</span>
                </h3>
                <button 
                  onClick={() => navigate(`/admin/dashboard`)}
                  className="px-5 py-2 rounded-md bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition"
                >
                  ← Back to Dashboard
                </button>
              </div>
              {/* Customer/info & item count */}
              <div className="flex flex-col sm:flex-row mb-6 justify-between items-start sm:items-center gap-2">
                <p>
                  <span className="text-gray-700 font-medium">Customer:</span>
                  <span className="font-mono text-base text-gray-500 ml-2">
                    {order?.customer?.first_name} {order?.customer?.last_name}
                  </span>
                </p>
                <div className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-xl font-bold shadow">
                  {order?.lineItems?.length || 0} item{order?.lineItems?.length === 1 ? "" : "s"}
                </div>
              </div>
              {/* Line Items */}
              <div className="flex flex-col gap-5">
                {lineItems.map((lineItem) => (
                  <div
                    key={lineItem.variantId}
                    className="flex flex-col sm:flex-row justify-between items-stretch border border-gray-100 rounded-lg p-4 shadow hover:shadow-md bg-gray-50 transition"
                  >
                    {/* Left: image + name + SKU + notes */}
                    <div className="flex flex-1 items-start">
                      <img
                        src={lineItem?.image}
                        alt={lineItem?.productTitle}
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg object-cover shadow"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                          {lineItem?.variantInfo?.title === "Default Title"
                            ? lineItem?.productTitle
                            : lineItem?.variantInfo?.title}
                          {(lineItem.adminNote || lineItem.customerNote) && (
                            <span title="This item has notes" className="text-yellow-500 ml-2">📌</span>
                          )}
                        </h3>
                        <p className="font-mono text-xs text-gray-500">SKU: {lineItem?.variantInfo?.sku}</p>
                        <span className="inline-block font-semibold text-sm text-gray-900 mt-1">
                          {lineItem?.quantity} unit{lineItem?.quantity === 1 ? "" : "s"}
                        </span>
                        {/* Notes Display */}
                        {lineItem.adminNote && (
                          <p className="text-xs text-orange-700 mt-2 bg-orange-50 px-2 py-1 rounded">
                            <span className="font-bold">Admin:</span> {lineItem.adminNote}
                          </p>
                        )}
                        {lineItem.customerNote && (
                          <p className="text-xs text-blue-700 mt-1 bg-blue-50 px-2 py-1 rounded">
                            <span className="font-bold">Customer:</span> {lineItem.customerNote}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Right: Actions */}
                    {!lineItem.picked && (
                      <div className="flex flex-row sm:flex-col items-center sm:items-end mt-3 sm:mt-0 sm:ml-4 space-x-2 sm:space-x-0 sm:space-y-2">
                        <button 
                          onClick={() => openNoteDialog(lineItem)}
                          className="hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 transition"
                          title="Add/Edit Note"
                        >
                          <PencilIcon className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Note Dialog */}
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

export default Order;