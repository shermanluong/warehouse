import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef} from 'react';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { 
    PlusIcon, 
    MinusIcon, 
    XMarkIcon, 
    CheckIcon,
    CameraIcon,
    PencilSquareIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import FlagDialog from '../../components/FlagDialog'
import axios from 'axios';
import Layout from '../../layouts/layout';
import ImageZoomModal from '../../components/ImageZoomModal';

const PickOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [lineItems, setLineItems] = useState([]);
    const [isScanningPreview, setIsScanningPreview] = useState(false);
    const [barcode, setBarcode] = useState("");
    const isScanning = useRef(false);
    const [isButtonScanning, setIsButtonScanning] = useState(false);
    const [allPicked, setAllPicked] = useState(false);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState('');

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
            item => item.picked || (item.flags && item.flags.length > 0)
        ));
    }, [lineItems]);

    const handlePickPlus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-plus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
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

    const handleScan = async (err, result)=> {
        if (isScanning.current) {
            if (result) {
                setBarcode(result.text);
                handlePickPlus(result.text);
            }
            else setBarcode("Not Found");
        } else {
            setBarcode("Not Found");
        }
    };

    const handleCompletePicking = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/complete-picking`, 
                { status: 'picked' }, 
                { headers: { Authorization: `Bearer ${token}` } 
            });
            navigate(`/picker/orders`);
        } catch (err) {
          console.error(err?.response?.data?.message);
        }
    };

    const [showDialog, setShowDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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
        flag,
        originalProductId,
        originalVariantId,
        substituteProductId,
        substituteVariantId,
      }) => {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-flag`,
          {
            productId: originalProductId,
            variantId: originalVariantId,
            reason: flag,
            substituteProductId,
            substituteVariantId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      
        fetchOrder();
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

                    {/* Scan input and button */}
                    {!isScanningPreview && ( 
                        <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
                            <input
                            type="text"
                            placeholder="Type item barcode"
                            className="flex-1 border border-gray-300 rounded-md p-2 mb-4 sm:mb-0"
                            />
                            <div className="flex flex-row space-x-2">
                                <button 
                                    className="flex-1 bg-blue-500 text-white p-2 px-4 rounded-md hover:bg-blue-600"
                                    onClick={() => {
                                    }}
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    className="border border-gray-500 bg-white p-2 px-4 rounded-md hover:bg-gray-600"
                                    onClick={() => {
                                        setIsScanningPreview(true);
                                    }}
                                >
                                    <CameraIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Barcode Scanner */}
                    {isScanningPreview && (
                        <>
                            <div className="relative w-full h-64 bg-gray-200 mb-4 overflow-hidden flex justify-center items-center">
                                <BarcodeScannerComponent
                                    onUpdate={
                                        (err, result) => {
                                            handleScan(err, result);
                                        }
                                    }
                                />
                            </div>
                            <div className="flex flex-row mb-3 gap-1">
                                <button
                                    className={`flex-1 text-white rounded-md p-2 hover:bg-blue-600 ${
                                        isScanning.current ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                    onClick={() => {
                                        isScanning.current = !isScanning.current
                                        setIsButtonScanning(!isButtonScanning)
                                    }}
                                >
                                    {isScanning.current ? "Stop Scanner" : "Start Scanner"}
                                </button>
                                <button 
                                    className="border border-gray-500 px-4 rounded-md hover:bg-gray-600"
                                    onClick={() => {
                                        setIsScanningPreview(false);
                                    }}
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Display the Scanned Barcode */}
                    <div>
                        <p>Scanned Barcode: {barcode}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {lineItems.map((lineItem) => (
                            <div key={lineItem.variantId} className = "border border-gray-200 rounded-lg p-4 shadow-md">
                                <div className="flex flex-col sm:flex-row justify-between">
                                    {/* Left side: image + name + SKU */}
                                    <div className="flex items-start">
                                        <img
                                            src={lineItem?.image}
                                            alt={lineItem?.productTitle}
                                            className="w-48 h-48 rounded object-cover cursor-pointer"
                                            onClick={() => {
                                                setEnlargedImage(lineItem?.image);
                                                setIsImageOpen(true);
                                            }}
                                        />
                                        <div className="ml-4">
                                            <h3 className="font-semibold text-2xl text-gray-900">
                                                {lineItem?.variantInfo?.title === "Default Title"
                                                    ? lineItem?.productTitle
                                                    : lineItem?.variantInfo?.title}
                                                {(lineItem.adminNote || lineItem.customerNote) && (
                                                    <span title="This item has notes" className="text-yellow-500 text-2xl ml-2">📌</span>
                                                )}
                                            </h3>

                                            <div className="flex gap-1 mt-2 mb-2 flex-wrap">
                                                {lineItem?.pickedStatus?.verifiedQuantity > 0 && (
                                                    <p className="text-lg text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                        {lineItem?.pickedStatus?.verifiedQuantity}/{lineItem?.quantity} verified
                                                    </p>
                                                )}

                                                {lineItem?.pickedStatus?.outOfStockQuantity > 0 && (
                                                    <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                        {lineItem?.pickedStatus?.outOfStockQuantity}/{lineItem?.quantity} Out Of Stock
                                                    </p>
                                                )}

                                                {lineItem?.pickedStatus?.damagedQuantity > 0 && (
                                                    <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                        {lineItem?.pickedStatus?.damagedQuantity}/{lineItem?.quantity} Damaged
                                                    </p>
                                                )}
                                            </div>

                                            <p className="font-semibold text-xl text-gray-900">SKU: {lineItem?.variantInfo?.sku}</p>
                                            <span className="font-semibold text-xl text-gray-900">
                                                { 
                                                    lineItem?.pickedStatus?.verifiedQuantity 
                                                    +
                                                    lineItem?.pickedStatus?.damagedQuantity 
                                                    +
                                                    lineItem?.pickedStatus?.outOfStockQuantity 
                                                } / {lineItem?.quantity} units
                                            </span>
                                            
                                            {/* Notes Display */}
                                            {lineItem.adminNote && (
                                            <p className="text-xl text-red-600 mt-1">Admin: {lineItem.adminNote}</p>
                                            )}
                                            {lineItem.customerNote && (
                                            <p className="text-xl text-blue-600 mt-1">Customer: {lineItem.customerNote}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4 space-x-3 sm:flex-col sm:justify-start sm:mt-0 sm:space-x-0 sm:space-y-2 ">
                                        
                                        {!lineItem.picked && !lineItem?.flags?.length >  0 && lineItem.quantity <= 1 &&
                                            <button
                                                title = "Pick item"
                                                onClick={() => handlePickPlus(lineItem.shopifyLineItemId)}
                                                className="bg-white text-green-600 border border-green-600 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                                            >
                                                <CheckIcon className="w-10 h-10" />
                                            </button>
                                        }

                                        {!lineItem.picked && !lineItem?.flags?.length >  0 && lineItem.quantity > 1 &&
                                            <>
                                                <button
                                                    title = "Add one Item"
                                                    onClick={() => handlePickPlus(lineItem.shopifyLineItemId)}
                                                    className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                                >
                                                    <PlusIcon className="w-10 h-10" />
                                                </button>
                                                <button
                                                    title = "Remove one Item"
                                                    onClick={() => handlePickMinus(lineItem.shopifyLineItemId)}
                                                    className="bg-white text-stone-400 border border-stone-400 hover:bg-stone-200 w-16 h-16 rounded flex items-center justify-center"
                                                >
                                                    <MinusIcon className="w-10 h-10" />
                                                </button>
                                            </>
                                        }

                                        {!lineItem.picked && !lineItem?.flags?.length >  0 && 
                                            <button 
                                                title = "Flag Item"
                                                onClick={() => openFlagDialog(lineItem)}
                                                className="bg-white text-red-600 border border-red-600 hover:bg-red-200 w-16 h-16 rounded flex items-center justify-center"
                                            >
                                                <XMarkIcon className="w-10 h-10" />
                                            </button>
                                        }

                                        {(lineItem.picked || lineItem?.flags?.length > 0) && 
                                            <button
                                                title = "Undo" 
                                                onClick={() => handleUndo(lineItem.shopifyLineItemId)}
                                                className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                            >
                                                <ArrowPathIcon className="w-10 h-10" />
                                            </button>
                                        }
                                    </div>
                                </div>

                                {lineItem?.substitution?.substituteProductId && 
                                    <div
                                        className="flex flex-col sm:flex-row mt-4 justify-between border border-yellow-600 rounded-lg p-4"
                                    >
                                        {/* Left side: image + name + SKU */}
                                        <div className="flex items-start">
                                            <img
                                                src={lineItem?.substitution?.variantInfo?.image}
                                                alt={lineItem?.substitution?.variantInfo?.title}
                                                className="w-36 h-36 rounded object-cover"
                                                onClick={() => {
                                                    setEnlargedImage(lineItem?.substitution?.variantInfo?.image);
                                                    setIsImageOpen(true);
                                                }}
                                            />
                                            <div className="ml-4 mt-2 sm:mt-0">
                                                <h3 className="font-semibold text-2xl text-yellow-600">
                                                    Subbed: {lineItem?.substitution?.variantInfo?.title}
                                                </h3>

                                                <p className="font-semibold text-xl text-gray-900">SKU: {lineItem?.substitution?.variantInfo?.sku}</p>
                                            </div>
                                        </div>
                                    </div>  
                                }
                            </div>
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
            {showDialog && selectedItem && (
                <FlagDialog
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                    lineItem={selectedItem}
                    onSubmit={handleFlagSubmit}
                    onSelectSubstitution= {handleSubstitutionSelect}
                />
            )}
            <ImageZoomModal
                isOpen={isImageOpen}
                onClose={() => setIsImageOpen(false)}
                imageUrl={enlargedImage}
            />
        </Layout>
    )
}

export default PickOrder;