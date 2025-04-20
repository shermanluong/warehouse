import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef} from 'react';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { 
    PlusIcon, 
    MinusIcon, 
    XMarkIcon, 
    CheckIcon,
    CameraIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline'
import FlagDialog from '../../components/FlagDialog'
import axios from 'axios';
import Layout from '../../layouts/layout';

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
    const [showDialog, setShowDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchOrder = async () => {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/picker/order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setOrder(res?.data || null);
          setLineItems(res?.data?.lineItems);
          console.log(res?.data);
        };
        fetchOrder();
    }, [id]);

    useEffect(() => {
        setAllPicked(lineItems.every(
            item => item.picked || (item.flags && item.flags.length > 0)
        ));
    }, [lineItems]);

    const handlePick = async (productId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-item`,  
                { productId }, 
                { headers: { Authorization: `Bearer ${token}` } 
            });
            setLineItems(lineItems =>
                lineItems.map(item =>
                item.productId === productId ? { ...item, picked: true } : item
                )
            );
        } catch (err) {
            console.error('Failed to pick item', err);
        }
    };

    const handlePickPlus = async (productId) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-plus`,
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            const updatedItem = res.data.item;
    
            setLineItems(prevItems =>
                prevItems.map(item =>
                    item.productId === productId
                        ? { ...item, picked: updatedItem.picked, pickedQuantity: updatedItem.pickedQuantity }
                        : item
                )
            );
        } catch (err) {
            console.error('Failed to pick plus', err);
        }
    };

    const handlePickMinus = async (productId) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-minus`,
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            const updatedItem = res.data.item;
    
            setLineItems(prevItems =>
                prevItems.map(item =>
                    item.productId === productId
                        ? { ...item, picked: updatedItem.picked, pickedQuantity: updatedItem.pickedQuantity }
                        : item
                )
            );
        } catch (err) {
            console.error('Failed to pick minus', err);
        }
    };

    const handleFlagSubmit = async ({ productId, flag }) => {
        console.log(productId);
        console.log(flag);
        const res = await axios.patch(
            `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-flag`,
            { 
                productId   : productId,
                reason      : flag 
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const updatedItem = res.data.item;
        setLineItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId
                    ? { ...item, flags: updatedItem?.flags}
                    : item
            )
        );
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

    const openFlagDialog = (item) => {
        setSelectedItem(item);
        setShowDialog(true);
    };

    if (!order) return <div>Loading...</div>;

    return (
        <Layout headerTitle={"Picking"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white p-4 rounded-sm shadow-md">
                    <div className="flex flex-row mb-4 justify-between">
                        <h3 className="font-semibold text-xl">Order: #{order?.shopifyOrderId}</h3>
                        <button 
                            onClick={() => navigate(`/picker/orders`)}
                            className="px-4 rounded-md hover:bg-blue-300"
                        >
                            Back to list
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
                                            {lineItem?.pickedQuantity} / {lineItem?.quantity} units
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
                                {lineItem.flags.length > 0 && !lineItem.picked  && (
                                    <span className="text-sm text-red-500 mt-2 sm:mt-0">⚠ {lineItem.flags.join(', ')}</span>
                                )}
                                
                                {lineItem.picked && (
                                    <span className="text-green-600 mt-2 sm:mt-0">✅ Verified</span>
                                )}

                                {!lineItem.picked && !lineItem.flags.length >  0 && (
                                    <div className="flex mt-4 space-x-3 sm:flex-col sm:items-start sm:mt-0 sm:space-x-0 sm:space-y-2 ">
                                        {lineItem.quantity <= 1 ? (
                                            <button
                                                onClick={() => handlePickPlus(lineItem.productId)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded flex items-center justify-center"
                                            >
                                                <CheckIcon className="w-5 h-5" />
                                            </button>
                                            ) : (
                                            <>
                                                <button
                                                    onClick={() => handlePickPlus(lineItem.productId)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded flex items-center justify-center"
                                                >
                                                    <PlusIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handlePickMinus(lineItem.productId)}
                                                    className="bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded flex items-center justify-center"
                                                >
                                                    <MinusIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        
                                        <button 
                                            onClick={() => openFlagDialog(lineItem)}
                                            className="bg-gray-500 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
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
                />
            )}
        </Layout>
    )
}

export default PickOrder;