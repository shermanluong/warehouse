// src/components/picker/ListView.jsx
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState} from 'react';
import axios from 'axios';
import FlagDialog from '../../components/FlagDialog'
import ImageZoomModal from '../../components/ImageZoomModal';
import BarcodeScanner from '../../components/BarcodeScanner';
import BarcodeListener from '../../components/BarcodeListener';
import PickLineItem from '../../components/PickLineItem';
import ToteSelector from './ToteSelector';

const ListView = ({id}) => {
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [lineItems, setLineItems] = useState([]);
    const [allPicked, setAllPicked] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState('');
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [barcodeStatus, setBarcodeStatus] = useState('');
    const [assignedTotes, setAssignedTotes] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
        const allItemsPicked = lineItems.every(item => item.picked);
        const totesAssigned = assignedTotes.length > 0;
        setAllPicked(allItemsPicked && totesAssigned);
    }, [lineItems, assignedTotes]);

    const handleCompletePicking = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/complete-picking`, 
                {},
                { headers: { Authorization: `Bearer ${token}` } 
            });
            navigate(`/picker/orders`);
        } catch (err) {
          console.error(err?.response?.data?.message);
        }
    };

    const openFlagDialog = (item) => {
        setSelectedItem(item);
        setShowDialog(true);
    };

    const handleFlagSubmit = async ({ shopifyLineItemId, reason, quantity }) => {
        console.log(quantity);
        await axios.patch(
            `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-flag`,
            { 
                shopifyLineItemId   : shopifyLineItemId,
                reason   : reason,
                quantity  : quantity 
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        fetchOrder();
    };

    const handleSubstitutionSelect = async ({
        shopifyLineItemId,
        reason,
        quantity,
        subbedProductId,
        subbedVariantId,
      }) => {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-substitute`,
          {
            shopifyLineItemId, 
            reason,
            quantity,
            subbedProductId,
            subbedVariantId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      
        fetchOrder();
    };

    const handleClickImage = (image) => {
        setEnlargedImage(image);
        setIsImageOpen(true);
    };

    const fetchOrder = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/picker/order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setOrder(res?.data || null);
        setLineItems(res?.data?.lineItems);
        console.log(res?.data);
    };

    const handleScan = async (barcode) => {
        if (barcode == '') {
            setBarcodeStatus("Please input barcode");
            setTimeout(() => setBarcodeStatus(""), 2000);
            return;
        }

        const scannedItem = lineItems.find(
            (item) => item.variantInfo?.barcode === barcode
        );
            
        if (!scannedItem) {
            setBarcodeStatus("No matching item found for the scanned barcode.");
        } else if (scannedItem.picked) {
            setBarcodeStatus("This item has already been picked.");
        } else {
            try {
                await axios.patch(
                    `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-plus`,
                    { shopifyLineItemId: scannedItem.shopifyLineItemId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setBarcodeStatus(`Successfully picked: ${scannedItem.productTitle}`);
                fetchOrder();
            } catch (err) {
                console.error("Failed to update picking status:", err);
                setBarcodeStatus("Failed to update picking status.");
            }
        }
    
        setTimeout(() => setBarcodeStatus(""), 2000);
    };
    
    if (!order) return <div>Loading...</div>;

    return (
        <>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            {/* Header row with order name and back button */}
            <div className="flex flex-row items-center justify-between mb-6">
              <h3 className="font-extrabold text-3xl text-blue-900 flex items-center">
                Order: {order?.name}
                {(order?.orderNote || order?.adminNote) && (
                  <span title="This order has notes" className="text-yellow-500 ml-4 text-2xl">📌</span>
                )}
              </h3>
              <button 
                onClick={() => navigate(`/picker/orders`)}
                className="px-6 py-2 rounded-xl bg-blue-100 hover:bg-blue-300 text-blue-900 font-bold text-lg shadow transition"
              >
                Back to list
              </button>
            </div>
      
            {/* Customer and picked badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 text-xl">
              <p>
                Customer: 
                <span className="font-mono text-gray-700 ml-2">
                  {order?.customer?.first_name} {order?.customer?.last_name}
                </span>
              </p>
              <div className="bg-green-400 text-white px-4 py-1 rounded-2xl font-bold text-lg shadow">
                {order.pickedCount}/{order.lineItems.length} picked
              </div>
            </div>
      
            {/* Notes */}
            {order?.adminNote && (
              <div className="my-3">
                <p className="text-lg font-semibold text-red-600">Admin Note: {order.adminNote}</p>
              </div>
            )}
            {order?.orderNote && (
              <div className="my-3">
                <p className="text-lg font-semibold text-blue-600">Customer Note: {order.orderNote}</p>
              </div>
            )}
      
            {/* Barcode section */}
            <div className="mb-5">
                <BarcodeScanner onScan={handleScan}/>
                <BarcodeListener onScan={handleScan} />
                {barcodeStatus && (
                    <div className="text-left text-2xl font-semibold text-yellow-600 mt-2">
                        {barcodeStatus}
                    </div>
                )}
            </div>
      
            {/* Line items */}
            <div className="flex flex-col gap-4">
              {lineItems.map((lineItem) => (
                <PickLineItem 
                  key={lineItem.shopifyLineItemId}
                  orderId={order._id}
                  lineItem={lineItem}
                  OnRefresh={fetchOrder}
                  OnClickImage={handleClickImage}
                  OnFlagDialog={openFlagDialog}
                />
              ))}
            </div>
            
            {/* Tote Selector */}
            <div className="my-6">
              <ToteSelector 
                orderId={order._id}
                assignedTotes={assignedTotes}
                onAssignedTotesChange={setAssignedTotes}
              />
            </div>
      
            {/* Complete Picking Button */}
            <button 
              disabled={!allPicked}
              onClick={handleCompletePicking}
              className={`w-full mt-4 py-4 rounded-xl font-extrabold text-xl shadow transition
                ${allPicked 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
              `}
            >
              Complete Picking
            </button>
          </div>
          
          {/* Dialogs */}
          <FlagDialog
            isOpen={showDialog}
            onClose={() => setShowDialog(false)}
            lineItem={selectedItem}
            onSubmit={handleFlagSubmit}
            onSelectSubstitution={handleSubstitutionSelect}
          />
          <ImageZoomModal
            isOpen={isImageOpen}
            onClose={() => setIsImageOpen(false)}
            imageUrl={enlargedImage}
          />
        </>
    );
};

export default ListView;