// src/components/picker/SingleItemView.jsx
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState} from 'react';
import axios from 'axios';
import FlagDialog from '../../components/FlagDialog'
import ImageZoomModal from '../../components/ImageZoomModal';
import BarcodeScanner from '../../components/BarcodeScanner';
import BarcodeListener from '../BarcodeListener';
import {
    PlusIcon, 
    MinusIcon, 
    XMarkIcon, 
    CheckIcon,
    ArrowPathIcon,
    ArrowLongRightIcon,
    ArrowLongLeftIcon
  } from '@heroicons/react/24/outline';

import ToteSelector from './ToteSelector';

const SingleItemView = ({id}) => {
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [lineItems, setLineItems] = useState([]);
    const [allPicked, setAllPicked] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState('');
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [barcodeStatus, setBarcodeStatus] = useState('');
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [assignedTotes, setAssignedTotes] = useState([]);
    const [imageLoaded, setImageLoaded] = useState(false);
    const currentImage = lineItems[currentItemIndex]?.image;

    const token = localStorage.getItem("token");
    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
        const allItemsPicked = lineItems.every(item => item.picked);
        const totesAssigned = assignedTotes.length > 0;
        setAllPicked(allItemsPicked && totesAssigned);
      }, [lineItems, assignedTotes]);

    useEffect(() => {
    // Reset imageLoaded when current item changes
    setImageLoaded(false);
    }, [currentImage]);

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

        if ( currentItemIndex < lineItems.length - 1 ) 
            setCurrentItemIndex(currentItemIndex + 1);
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

    const handleItemChange = (newItemIndex) => {
        setCurrentItemIndex(newItemIndex);
    };

    const handlePickPlus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-plus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchOrder();

            if (currentItemIndex < lineItems.length - 1 && lineItems[currentItemIndex].pickedStatus.verified.quantity == lineItems[currentItemIndex].quantity - 1) 
                setCurrentItemIndex(currentItemIndex + 1);
        } catch (err) {
            console.error('Failed to pick plus', err);
        }
    };

    const handlePickMinus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-minus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to pick minus', err);
        }
    };

    const handleUndo = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/undo-item`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to undo', err);
        }
    };
    
    if (!order) return <div>Loading...</div>;

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl mx-auto mt-4">
                {/* Top bar */}
                <div className="flex flex-row mb-6 justify-between items-center">
                    <h3 className="font-bold text-4xl tracking-tight text-green-800">
                        Order: {order?.name}
                        {(order?.orderNote || order?.adminNote) && (
                            <span title="This order has notes" className="text-yellow-500 ml-3 text-3xl">📌</span>
                        )}
                    </h3>
                    <button 
                        onClick={() => navigate(`/picker/orders`)}
                        className="rounded-full bg-blue-200 hover:bg-blue-400 transition-colors p-3">
                        <ArrowLongRightIcon className="w-8 h-8" />
                    </button>
                </div>

                {/* Customer and picked count */}
                <div className="flex flex-row mb-6 justify-between items-center text-2xl">
                    <span>
                        <span className="font-bold text-gray-800">Customer:</span>
                        <span className="font-mono text-green-700 ml-3">
                            {order?.customer?.first_name} {order?.customer?.last_name}
                        </span>
                    </span>
                    <div className="bg-green-500 text-white text-lg px-5 py-1 rounded-3xl shadow whitespace-nowrap min-w-[90px] text-center">
                        {order.pickedCount}/{order.lineItems.length} picked
                    </div>
                </div>

                {/* Notes */}
                {order?.adminNote && (
                    <div className="my-4">
                        <p className="text-2xl font-bold text-red-700">Admin Note: {order.adminNote}</p>
                    </div>
                )}
                {order?.orderNote && (
                    <div className="my-4">
                        <p className="text-2xl font-bold text-blue-700">Customer Note: {order.orderNote}</p>
                    </div>
                )}

                <div className="mb-5">
                    <ToteSelector 
                        orderId={order._id}
                        assignedTotes={assignedTotes}
                        onAssignedTotesChange={setAssignedTotes}
                    />
                </div>

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

                {/* Navigation buttons */}
                <div className="flex justify-between mb-6">
                    <button
                        className={`w-24 h-24 rounded-full shadow-lg text-3xl flex items-center justify-center ${
                            currentItemIndex > 0 ? "bg-gray-200 hover:bg-gray-400" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => handleItemChange(currentItemIndex - 1)}
                        disabled={currentItemIndex === 0}
                    >
                        <ArrowLongLeftIcon className="w-10 h-10" />
                    </button>
                    <button
                        className={`w-24 h-24 rounded-full shadow-lg text-3xl flex items-center justify-center ${
                            currentItemIndex < lineItems.length - 1 ? "bg-gray-200 hover:bg-gray-400" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => handleItemChange(currentItemIndex + 1)}
                        disabled={currentItemIndex >= lineItems.length - 1}
                    >
                        <ArrowLongRightIcon className="w-10 h-10" />
                    </button>
                </div>
                
                {/* Main item display */}
                <div className="flex flex-col mt-2">
                    {lineItems.length > 0 && (
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between">
                                {/* Left: Image, large name, SKU */}
                                <div className="flex-1 flex flex-col items-center">
                                    <h3 className="text-center font-extrabold text-3xl mb-6 text-gray-900">
                                        {currentItemIndex + 1} - {lineItems[currentItemIndex]?.variantInfo?.title === "Default Title"
                                            ? lineItems[currentItemIndex]?.productTitle
                                            : lineItems[currentItemIndex]?.variantInfo?.title}
                                        {(lineItems[currentItemIndex].adminNote || lineItems[currentItemIndex].customerNote) && (
                                            <span title="This item has notes" className="text-yellow-500 text-2xl ml-2">📌</span>
                                        )}
                                    </h3>
                                    <div className="relative w-48 h-48 mb-4">
                                        {!imageLoaded && (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-lg">
                                                Loading...
                                            </div>
                                        )}
                                        {currentImage && (
                                            <img
                                                src={currentImage}
                                                alt={lineItems[currentItemIndex]?.productTitle}
                                                className={`absolute top-0 left-0 w-full h-full rounded-2xl object-cover cursor-pointer transition-opacity duration-300 border-4 border-blue-200 ${
                                                    imageLoaded ? 'opacity-100' : 'opacity-0'
                                                }`}
                                                onLoad={() => setImageLoaded(true)}
                                                onClick={() => handleClickImage(currentImage)}
                                            />
                                        )}
                                    </div>
                                    <span className="font-bold text-xl text-gray-900 mb-2">
                                        SKU: {lineItems[currentItemIndex]?.variantInfo?.sku}
                                    </span>
                                    {lineItems[currentItemIndex]?.variantInfo?.barcode && (
                                        <p className="font-bold text-lg text-yellow-800 mb-2">{lineItems[currentItemIndex]?.variantInfo?.barcode}</p>
                                    )}
                                    <span className="font-bold text-2xl text-gray-900 mb-2">
                                        { 
                                            lineItems[currentItemIndex]?.pickedStatus?.verified.quantity 
                                            +
                                            lineItems[currentItemIndex]?.pickedStatus?.damaged.quantity 
                                            +
                                            lineItems[currentItemIndex]?.pickedStatus?.outOfStock.quantity 
                                        } / {lineItems[currentItemIndex]?.quantity} units
                                    </span>
                                </div>
                                
                                {/* Right: Action & notes */}
                                <div className="flex flex-col items-center justify-center space-y-3 flex-1 min-w-[280px]">
                                    {/* Status tags */}
                                    <div className="flex gap-2 mt-2 mb-2 flex-wrap justify-center">
                                        {lineItems[currentItemIndex]?.pickedStatus?.verified.quantity > 0 && (
                                            <span className="text-2xl font-bold text-white bg-green-600 rounded-2xl px-4 py-1">
                                                {lineItems[currentItemIndex]?.pickedStatus?.verified.quantity} picked
                                            </span>
                                        )}
                                        {lineItems[currentItemIndex]?.pickedStatus?.outOfStock.quantity > 0 && (
                                            <span className="text-2xl font-bold text-white bg-red-600 rounded-2xl px-4 py-1">
                                                {lineItems[currentItemIndex]?.pickedStatus?.outOfStock.quantity} Out Of Stock
                                            </span>
                                        )}
                                        {lineItems[currentItemIndex]?.pickedStatus?.damaged.quantity > 0 && (
                                            <span className="text-2xl font-bold text-white bg-red-400 rounded-2xl px-4 py-1">
                                                {lineItems[currentItemIndex]?.pickedStatus?.damaged.quantity} Damaged
                                            </span>
                                        )}
                                    </div>
                                    {/* Notes */}
                                    {lineItems[currentItemIndex].adminNote && (
                                        <p className="text-2xl text-red-700 mt-1 text-center">Admin: {lineItems[currentItemIndex].adminNote}</p>
                                    )}
                                    {lineItems[currentItemIndex].customerNote && (
                                        <p className="text-2xl text-blue-700 mt-1 text-center">Customer: {lineItems[currentItemIndex].customerNote}</p>
                                    )}
                                    {/* Action buttons */}
                                    <div className="flex justify-center mt-4 space-x-10">
                                        {!lineItems[currentItemIndex].picked && lineItems[currentItemIndex].quantity <= 1 &&
                                            <button
                                                title="Pick item"
                                                onClick={() => handlePickPlus(lineItems[currentItemIndex].shopifyLineItemId)}
                                                className="bg-white text-green-700 border-4 border-green-600 hover:bg-green-200 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl"
                                            >
                                                <CheckIcon className="w-10 h-10" />
                                            </button>
                                        }
                                        {!lineItems[currentItemIndex].picked && lineItems[currentItemIndex].quantity > 1 &&
                                            <>
                                                <button
                                                    title="Add one Item"
                                                    onClick={() => handlePickPlus(lineItems[currentItemIndex].shopifyLineItemId)}
                                                    className="bg-white text-blue-700 border-4 border-blue-500 hover:bg-blue-200 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl"
                                                >
                                                    <PlusIcon className="w-10 h-10" />
                                                </button>
                                                <button
                                                    title="Remove one Item"
                                                    onClick={() => handlePickMinus(lineItems[currentItemIndex].shopifyLineItemId)}
                                                    className="bg-white text-gray-500 border-4 border-gray-400 hover:bg-stone-200 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl"
                                                >
                                                    <MinusIcon className="w-10 h-10" />
                                                </button>
                                            </>
                                        }
                                        {!lineItems[currentItemIndex].picked && 
                                            <button 
                                                title="Flag Item"
                                                onClick={() => openFlagDialog(lineItems[currentItemIndex])}
                                                className="bg-white text-red-700 border-4 border-red-600 hover:bg-red-200 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl"
                                            >
                                                <XMarkIcon className="w-10 h-10" />
                                            </button>
                                        }
                                        {lineItems[currentItemIndex].picked && 
                                            <button
                                                title="Undo" 
                                                onClick={() => handleUndo(lineItems[currentItemIndex].shopifyLineItemId)}
                                                className="bg-white text-blue-700 border-4 border-blue-500 hover:bg-blue-200 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl"
                                            >
                                                <ArrowPathIcon className="w-10 h-10" />
                                            </button>
                                        }
                                    </div>
                                </div>
                            </div>
                            {/* Substitution Display */}
                            {lineItems[currentItemIndex]?.substitution?.shopifyVariantId && 
                                <div className="flex flex-col sm:flex-row mt-6 mb-2 justify-center border-4 border-yellow-600 rounded-xl p-6 bg-yellow-50">
                                    <div className="flex items-center">
                                        <img
                                            src={lineItems[currentItemIndex]?.substitution?.image}
                                            alt={lineItems[currentItemIndex]?.substitution?.title}
                                            className="w-44 h-44 rounded-xl object-cover cursor-pointer border-2 border-yellow-400"
                                            onClick={() => handleClickImage(lineItems[currentItemIndex]?.substitution?.image)}
                                        />
                                        <div className="ml-6">
                                            <h3 className="font-bold text-2xl text-yellow-700">
                                                Subbed: {lineItems[currentItemIndex]?.substitution?.title}
                                            </h3>
                                            <p className="font-bold text-xl text-gray-900">SKU: {lineItems[currentItemIndex]?.substitution?.sku}</p>
                                        </div>
                                    </div>
                                </div>  
                            }
                        </div>
                    )}
                </div>

                <button 
                    disabled={!allPicked}
                    onClick={handleCompletePicking}
                    className={`w-full mt-8 rounded-2xl text-3xl p-4 font-bold shadow-xl transition-all
                        ${allPicked 
                            ? 'bg-blue-600 hover:bg-blue-800 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                >
                    Complete Picking
                </button>
            </div>
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

export default SingleItemView;