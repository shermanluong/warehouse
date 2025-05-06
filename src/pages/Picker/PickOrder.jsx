import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState} from 'react';
import FlagDialog from '../../components/FlagDialog'
import axios from 'axios';
import Layout from '../../layouts/layout';
import ImageZoomModal from '../../components/ImageZoomModal';
import BarcodeScanner from '../../components/BarcodeScanner';
import PickLineItem from '../../components/PickLineItem';

const PickOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [lineItems, setLineItems] = useState([]);
    const [allPicked, setAllPicked] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState('');
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    
    const token = localStorage.getItem("token");

    const fetchOrder = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/picker/order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setOrder(res?.data || null);
        setLineItems(res?.data?.lineItems);
        console.log(res?.data);
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
        setAllPicked(lineItems.every(
            item => item.picked
        ));
    }, [lineItems]);

    const handleCompletePicking = async () => {
        console.log(token);
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

    const handleScan = async (barcode) => {
        const scannedItem = order?.lineItems.find(
            (item) => item.variantInfo?.barcode == barcode
        );
    
        if (scannedItem) {
            try {
                await axios.patch(
                    `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-plus`,
                    { shopifyLineItemId: scannedItem.shopifyLineItemId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
    
                fetchOrder();
            } catch (err) {
                console.error("Failed to increment pick count:", err);
            }
        } else {
            console.log("1 No matching line item found");
        }
    };
    
    if (!order) return <div>Loading...</div>;

    return (
        <Layout headerTitle={"Picking"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white p-4 rounded-sm shadow-md">
                    <div className="flex flex-row mb-4 justify-between">

                        <h3 className="font-semibold text-3xl">Order: {order?.name}

                        {(order?.orderNote || order?.adminNote) && (
                            <span title="This order has notes" className="text-yellow-500 ml-2">📌</span>
                        )}
                        </h3>
                        <button 
                            onClick={() => navigate(`/picker/orders`)}
                            className="px-4 rounded-md hover:bg-blue-300"
                        >
                            Back to list
                        </button>
                    </div>

                    <div className="flex flex-row mb-4 justify-between text-xl">
                        <p>Customer: 
                            <span className="font-mono text-gray-700 ml-2">
                                {order?.customer?.first_name} {order?.customer?.last_name}
                            </span>
                        </p>
                        <div className="bg-green-400 px-3 rounded-2xl">{order.lineItems.length} items</div>
                    </div>

                    {order?.adminNote && (
                        <div className="my-3">
                            <p className="text-sm font-semibold text-red-600">Admin Note: {order.adminNote}</p>
                        </div>
                    )}
                        
                    {order?.orderNote && (
                        <div className="my-3">
                            <p className="text-sm font-semibold text-red-600">Customer Note: {order.orderNote}</p>
                        </div>
                    )}

                    <BarcodeScanner 
                        OnScan={handleScan}
                    />

                    <div className="flex flex-col gap-4">
                        {lineItems.map((lineItem) => (
                            <PickLineItem 
                                key={lineItem.shopifyLineItemId}
                                orderId = {order._id}
                                lineItem = {lineItem}
                                OnRefresh = {fetchOrder}
                                OnClickImage = {handleClickImage}
                                OnFlagDialog = {openFlagDialog}
                            />
                        ))}
                    </div>

                    <button 
                        disabled={!allPicked}
                        onClick={handleCompletePicking}
                        className={`w-full mt-4 rounded-sm p-2 
                            ${allPicked 
                                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        Complete Picking
                    </button>
                </div>
            </div>
            <FlagDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                lineItem={selectedItem}
                onSubmit={handleFlagSubmit}
                onSelectSubstitution= {handleSubstitutionSelect}
            />
            <ImageZoomModal
                isOpen={isImageOpen}
                onClose={() => setIsImageOpen(false)}
                imageUrl={enlargedImage}
            />
        </Layout>
    )
}

export default PickOrder;