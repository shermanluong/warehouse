// src/components/picker/SingleItemView.jsx
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState} from 'react';
import axios from 'axios';
import FlagDialog from '../../components/FlagDialog'
import ImageZoomModal from '../../components/ImageZoomModal';
import BarcodeScanner from '../../components/BarcodeScanner';
import BarcodeListener from '../BarcodeListener';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    PlusIcon, 
    MinusIcon, 
    XMarkIcon, 
    CheckIcon,
    ArrowPathIcon
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
    const imageSizeClass = "w-[200px] h-[200px]"; // or use w-full h-full if inside a fixed container

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
        console.log(res?.data);
    };

    const handleScan = async (barcode) => {
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
            <div className="bg-white p-4 rounded-sm shadow-md relative">
                {/* Navigation buttons */}
                {currentItemIndex > 0 && (
                    <button
                    className="absolute left-0 top-90 transform -translate-y-1/2 px-2 py-2 bg-gray-200 rounded-md shadow"
                    onClick={() => handleItemChange(currentItemIndex - 1)}
                    >
                    <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                )}
                
                {currentItemIndex < lineItems.length - 1  && (
                    <button
                    className="absolute right-0 top-90 transform -translate-y-1/2 px-2 py-2 bg-gray-200 rounded-md shadow"
                    onClick={() => handleItemChange(currentItemIndex + 1)}
                    >
                    <ArrowRightIcon className="w-5 h-5" />
                    </button>
                )}

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
                    <div className="bg-green-400 px-3 rounded-2xl">{order.pickedCount}/{order.lineItems.length} picked</div>
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

                <BarcodeScanner onScan={handleScan}/>
                <BarcodeListener onScan={handleScan} />

                <div className="flex flex-col mt-6">
                    {lineItems.length > 0 && (
                        <div className = "">
                            <div className="flex flex-col sm:flex-row justify-between">
                                {/* Left side: image + name + SKU */}
                                <h3 className="text-center font-semibold text-2xl text-gray-900 mb-10">
                                    {currentItemIndex + 1} - {lineItems[currentItemIndex]?.variantInfo?.title === "Default Title"
                                        ? lineItems[currentItemIndex]?.productTitle
                                        : lineItems[currentItemIndex]?.variantInfo?.title}
                                    {(lineItems[currentItemIndex].adminNote || lineItems[currentItemIndex].customerNote) && (
                                        <span title="This item has notes" className="text-yellow-500 text-2xl ml-2">📌</span>
                                    )}
                                </h3>
                
                                <div className="flex justify-center">
                                    <div className="flex flex-col justify-center ml-5 mr-10">
                                        <p className="font-semibold text-xl text-gray-900">SKU: {lineItems[currentItemIndex]?.variantInfo?.sku}</p>
                                        {lineItems[currentItemIndex]?.variantInfo?.barcode && 
                                            <p className="font-semibold text-sm text-yellow-900">Barcode: {lineItems[currentItemIndex]?.variantInfo?.barcode}</p>
                                        }
                                        <span className="font-semibold text-xl text-gray-900">
                                            { 
                                                lineItems[currentItemIndex]?.pickedStatus?.verified.quantity 
                                                +
                                                lineItems[currentItemIndex]?.pickedStatus?.damaged.quantity 
                                                +
                                                lineItems[currentItemIndex]?.pickedStatus?.outOfStock.quantity 
                                            } / {lineItems[currentItemIndex]?.quantity} units
                                        </span>
                
                                        <div className="flex gap-1 mt-2 mb-2 flex-wrap">
                                            {lineItems[currentItemIndex]?.pickedStatus?.verified.quantity > 0 && (
                                                <p className="text-lg text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                    {lineItems[currentItemIndex]?.pickedStatus?.verified.quantity} picked
                                                </p>
                                            )}
                
                                            {lineItems[currentItemIndex]?.pickedStatus?.outOfStock.quantity > 0 && (
                                                <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                    {lineItems[currentItemIndex]?.pickedStatus?.outOfStock.quantity} Out Of Stock
                                                </p>
                                            )}
                
                                            {lineItems[currentItemIndex]?.pickedStatus?.damaged.quantity > 0 && (
                                                <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                    {lineItems[currentItemIndex]?.pickedStatus?.damaged.quantity} Damaged
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Notes Display */}
                                        {lineItems[currentItemIndex].adminNote && (
                                        <p className="text-xl text-red-600 mt-1">Admin: {lineItems[currentItemIndex].adminNote}</p>
                                        )}
                
                                        {lineItems[currentItemIndex].customerNote && (
                                        <p className="text-xl text-blue-600 mt-1">Customer: {lineItems[currentItemIndex].customerNote}</p>
                                        )}
                                    </div>
                                    <div className="relative w-[200px] h-[200px]">
                                        {!imageLoaded && (
                                            <div className="w-50 h-50 flex items-center justify-center bg-gray-100">
                                                Loading...
                                            </div>
                                        )}
                                        
                                        {currentImage && (
                                            <img
                                            src={currentImage}
                                            alt={lineItems[currentItemIndex]?.productTitle}
                                            className={`absolute top-0 left-0 w-full h-full rounded object-cover cursor-pointer transition-opacity duration-300 ${
                                                imageLoaded ? 'opacity-100' : 'opacity-0'
                                            }`}
                                            onLoad={() => setImageLoaded(true)}
                                            onClick={() => handleClickImage(currentImage)}
                                            />
                                        )}
                                    </div>
                                </div>
                
                                <div className="flex justify-center mt-4 space-x-20">
                                    
                                    {!lineItems[currentItemIndex].picked && lineItems[currentItemIndex].quantity <= 1 &&
                                        <button
                                            title = "Pick item"
                                            onClick={() => handlePickPlus(lineItems[currentItemIndex].shopifyLineItemId)}
                                            className="bg-white text-green-600 border border-green-600 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                                        >
                                            <CheckIcon className="w-10 h-10" />
                                        </button>
                                    }
                
                                    {!lineItems[currentItemIndex].picked && lineItems[currentItemIndex].quantity > 1 &&
                                        <>
                                            <button
                                                title = "Add one Item"
                                                onClick={() => handlePickPlus(lineItems[currentItemIndex].shopifyLineItemId)}
                                                className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                            >
                                                <PlusIcon className="w-10 h-10" />
                                            </button>
                                            <button
                                                title = "Remove one Item"
                                                onClick={() => handlePickMinus(lineItems[currentItemIndex].shopifyLineItemId)}
                                                className="bg-white text-stone-400 border border-stone-400 hover:bg-stone-200 w-16 h-16 rounded flex items-center justify-center"
                                            >
                                                <MinusIcon className="w-10 h-10" />
                                            </button>
                                        </>
                                    }
                
                                    {!lineItems[currentItemIndex].picked && 
                                        <button 
                                            title = "Flag Item"
                                            onClick={() => openFlagDialog(lineItems[currentItemIndex])}
                                            className="bg-white text-red-600 border border-red-600 hover:bg-red-200 w-16 h-16 rounded flex items-center justify-center"
                                        >
                                            <XMarkIcon className="w-10 h-10" />
                                        </button>
                                    }
                
                                    {lineItems[currentItemIndex].picked && 
                                        <button
                                            title = "Undo" 
                                            onClick={() => handleUndo(lineItems[currentItemIndex].shopifyLineItemId)}
                                            className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                        >
                                            <ArrowPathIcon className="w-10 h-10" />
                                        </button>
                                    }
                                </div>
                            </div>
                
                            {lineItems[currentItemIndex]?.substitution?.shopifyVariantId && 
                                <div
                                    className="flex flex-col sm:flex-row mt-4 mb-2 justify-between border border-yellow-600 rounded-lg p-4"
                                >
                                    {/* Left side: image + name + SKU */}
                                    <div className="flex items-start">
                                        <img
                                            src={lineItems[currentItemIndex]?.substitution?.image}
                                            alt={lineItems[currentItemIndex]?.substitution?.title}
                                            className="w-36 h-36 rounded object-cover"
                                            onClick={() => handleClickImage(lineItems[currentItemIndex]?.substitution?.image)}
                                        />
                                        <div className="ml-4 mt-2 sm:mt-0">
                                            <h3 className="font-semibold text-2xl text-yellow-600">
                                                Subbed: {lineItems[currentItemIndex]?.substitution?.title}
                                            </h3>
                
                                            <p className="font-semibold text-xl text-gray-900">SKU: {lineItems[currentItemIndex]?.substitution?.sku}</p>
                                        </div>
                                    </div>
                                </div>  
                            }
                        </div>
                    )}
                </div>

                <ToteSelector 
                    orderId = {order._id}
                    assignedTotes={assignedTotes}
                    onAssignedTotesChange={setAssignedTotes}
                />

                <button 
                    disabled={!allPicked}
                    onClick={handleCompletePicking}
                    className={`w-full mt-4 rounded-md p-2 
                        ${allPicked 
                            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
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
                onSelectSubstitution= {handleSubstitutionSelect}
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