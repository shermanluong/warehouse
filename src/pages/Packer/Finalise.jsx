import Layout from '../../layouts/layout';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import { 
    PlusIcon, 
    MinusIcon, 
    CheckIcon,
    CameraIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    CurrencyDollarIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import axios from 'axios';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import Webcam from "react-webcam";

export default function Finalise() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [lineItems, setLineItems] = useState([]);
    const [isScanningPreview, setIsScanningPreview] = useState(false);
    const [barcode, setBarcode] = useState("");
    const isScanning = useRef(false);
    const [isButtonScanning, setIsButtonScanning] = useState(false);
    const [cameraStarted, setCameraStarted] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [photoCaptured, setPhotoCaptured] = useState(false);
    const videoElement = useRef(null);
    const token = localStorage.getItem("token");

    const fetchOrder = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/packer/order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setOrder(res?.data || null);
        setLineItems(res?.data?.lineItems);
        console.log(res?.data);
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleStartCamera = () => {
        setCameraStarted(true);
        setCapturedImage(null);
        setPhotoCaptured(false);
    };

    const handleStopCamera = () => {
        setCameraStarted(false);
    };

    const handleCapture = () => {
        const imageSrc = videoElement.current.getScreenshot();
        setCapturedImage(imageSrc);
        setCameraStarted(false);
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setCameraStarted(true);
        setPhotoCaptured(false);
    };

    const handleAcceptImage = () => {
        setPhotoCaptured(true);
        setCameraStarted(false);
    };

    const handlePackPlus = async (productId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/pack-plus`,
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to pick plus', err);
        }
    };

    const handlePackMinus = async (productId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/pack-minus`,
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to pick minus', err);
        }
    };

    const handleUndo = async (productId, variantId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/undo-item`,
                { productId, variantId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to undo', err);
        }
    };

    const handleCancelSubstitution = async (productId, variantId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/cancel-sub-item`,
                { productId, variantId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to cancel substitution item', err);
        }
    };

    const handleConfirmSubstitution = async (productId, variantId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/confirm-sub-item`,
                { productId, variantId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to confirm substitution item', err);
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

    return (
        <Layout headerTitle={"Packing"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Your content */}
                <div className="bg-white p-4 rounded-sm shadow-md">
                    {/* Header */}
                    <div className="flex flex-row mb-4 justify-between">
                        <h3 className="font-semibold text-xl">Order: #{order?.shopifyOrderId}</h3>
                        <button 
                            onClick={() => navigate(`/packer/orders`)}
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
                        <div className="bg-green-400 text-sm px-2 rounded-xl">{order?.lineItems.length} items</div>
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

                    {/* Scan input and buttons */}
                    {!isScanningPreview && (
                        <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
                            <input
                                type="text"
                                placeholder="Scan item barcode"
                                className="flex-1 border border-gray-300 rounded-md p-2 mb-4 sm:mb-0"
                            />
                            <div className="flex flex-row space-x-2">
                                <button className="flex-1 bg-blue-500 text-white p-2 px-4 rounded-md hover:bg-blue-600">
                                <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button
                                    className="border border-gray-500 bg-white p-2 px-4 rounded-md hover:bg-gray-600"
                                    onClick={() => setIsScanningPreview(true)}
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
                                    onUpdate={(err, result) => handleScan(err, result)}
                                />
                            </div>
                            <div className="flex flex-row mb-3 gap-1">
                                <button
                                    className={`flex flex-1 items-center justify-center gap-2 text-white rounded-md p-2 ${
                                        isScanning.current ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                    onClick={() => {
                                        isScanning.current = !isScanning.current;
                                        setIsButtonScanning(!isButtonScanning);
                                    }}
                                >
                                <CameraIcon className="w-5 h-5" />
                                {isScanning.current ? "Stop Scanning" : "Start Scanning"}
                                </button>
                                <button
                                    className="border border-gray-500 px-4 rounded-md hover:bg-gray-600"
                                    onClick={() => setIsScanningPreview(false)}
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Display Scanned Barcode */}
                    <div className="mb-4">
                        <p>Scanned Barcode: {barcode}</p>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-col gap-4">
                        {lineItems.map((lineItem) => (
                            <div key={lineItem.variantId} className = "border border-gray-200 rounded-lg p-4 shadow-md">
                                <div className="flex flex-col sm:flex-row  justify-between ">
                                    {/* Left side: image + name + SKU */}
                                    <div className="flex items-start">
                                        <img
                                            src={lineItem?.image}
                                            alt={lineItem?.productTitle}
                                            className="w-48 h-48 rounded object-cover"
                                        />
                                        <div className="ml-4 mt-2 sm:mt-0">
                                            <h3 className="font-semibold text-2xl text-gray-900">
                                            {lineItem?.variantInfo?.title === "Default Title"
                                                ? lineItem?.productTitle
                                                : lineItem?.variantInfo?.title}
                                    
                                            {(lineItem.adminNote || lineItem.customerNote) && (
                                                <span title="This item has notes" className="text-yellow-500 text-2xl ml-2">📌</span>
                                            )}
                                            </h3>

                                            <div className="flex gap-2 mt-2 mb-2">
                                                {lineItem.packed && (
                                                    <span className="text-lg text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">Verified</span>
                                                )}

                                                {lineItem?.flags?.length > 0 && !lineItem?.picked  && (
                                                    <span className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">{lineItem.flags.join(', ')}</span>
                                                )}
                                            </div>

                                            <p className="font-semibold text-xl text-gray-900">SKU: {lineItem?.variantInfo?.sku}</p>
                                            <span className="font-semibold text-xl text-gray-900">
                                                {lineItem?.packedQuantity || 0} packed / {lineItem.quantity} units
                                            </span>

                                            {/* Show notes if any */}
                                            {lineItem.adminNote && (
                                                <p className="text-xl text-red-600 mt-1">Admin note: {lineItem.adminNote}</p>
                                            )}
                                            {lineItem.customerNote && (
                                                <p className="text-xl text-blue-600 mt-1">Customer note: {lineItem.customerNote}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end mt-4 space-x-3 sm:flex-col sm:justify-start sm:mt-0 sm:space-x-0 sm:space-y-2 ">
                                        {!lineItem.packed && !lineItem.flags.length >  0 && lineItem.quantity <= 1 &&  
                                            <button
                                                title="Pack Item"
                                                onClick={() => handlePackPlus(lineItem.productId)}
                                                className="bg-white text-green-600 border border-green-600 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                                            >
                                                <CheckIcon className="w-10 h-10" />
                                            </button>
                                        }

                                        {!lineItem.packed && !lineItem.flags.length >  0 && lineItem.quantity > 1 && 
                                            <>
                                                <button
                                                    title="Add one Item"
                                                    onClick={() => handlePackPlus(lineItem.productId)}
                                                    className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                                >
                                                    <PlusIcon className="w-10 h-10" />
                                                </button>
                                                <button
                                                    title="remove one Item"
                                                    onClick={() => handlePackMinus(lineItem.productId)}
                                                    className="bg-white text-stone-400 border border-stone-400 hover:bg-stone-200 w-16 h-16 rounded flex items-center justify-center"
                                                >
                                                    <MinusIcon className="w-10 h-10" />
                                                </button>
                                            </>
                                        }

                                        { lineItem.packed  && 
                                            <button
                                                title="Undo" 
                                                onClick={() => handleUndo(lineItem?.productId, lineItem?.variantId)}
                                                className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                            >
                                                <ArrowPathIcon className="w-10 h-10" />
                                            </button>
                                        }

                                        { lineItem?.flags?.length > 0 && !lineItem?.substitution?.substituteProductId && 
                                            <button 
                                                onClick={() => openFlagDialog(lineItem)}
                                                className="bg-white text-green-400 border border-green-400 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                                            >
                                                <CurrencyDollarIcon className="w-10 h-10" />
                                            </button>
                                        }
                                    </div>
                                </div>

                                {lineItem?.substitution?.substituteProductId && 
                                    <div
                                        className="flex flex-col sm:flex-row  justify-between border border-yellow-600 rounded-lg p-4"
                                    >
                                        {/* Left side: image + name + SKU */}
                                        <div className="flex items-start">
                                            <img
                                                src={lineItem?.substitution?.variantInfo?.image}
                                                alt={lineItem?.substitution?.variantInfo?.title}
                                                className="w-36 h-36 rounded object-cover"
                                            />
                                            <div className="ml-4 mt-2 sm:mt-0">
                                                <h3 className="font-semibold text-2xl text-yellow-600">
                                                    Subbed: {lineItem?.substitution?.variantInfo?.title}
                                                </h3>

                                                <div className="flex gap-2 mt-2 mb-2">
                                                    {lineItem?.substitution?.used && (
                                                        <span className="text-lg text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">Verified</span>
                                                    )}
                                                </div>

                                                <p className="font-semibold text-xl text-gray-900">SKU: {lineItem?.substitution?.variantInfo?.sku}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end mt-4 space-x-3 sm:flex-col sm:justify-start sm:mt-0 sm:space-x-0 sm:space-y-2 ">
                                            {!lineItem?.substitution?.used && (
                                                <>
                                                    <button
                                                        title = "Confirm Substitution"
                                                        onClick={() => handleConfirmSubstitution(lineItem?.productId, lineItem?.variantId)}
                                                        className="bg-white text-green-600 border border-green-600 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                                                    >
                                                        <CheckIcon className="w-10 h-10" />
                                                    </button>
                                                    <button
                                                        title = "Cancel Substitution" 
                                                        onClick={() => handleCancelSubstitution(lineItem?.productId, lineItem?.variantId)}
                                                        className="bg-white text-red-600 border border-red-600 hover:bg-red-200 w-16 h-16 rounded flex items-center justify-center"
                                                    >
                                                        <XMarkIcon className="w-10 h-10" />
                                                    </button>
                                                </>   
                                            )}
                                        </div>
                                    </div>  
                                }
                            </div>
                        ))}
                    </div>

                    {/* Capture Packing Photo Section */}
                    <div className="mt-4 mb-4">
                        <p className="font-semibold text-lg">
                            {photoCaptured ? "Photo Captured" : "Capture Packing Photo"}
                        </p>

                        <div className="relative mx-auto my-4" style={{ width: 400, aspectRatio: '4 / 3' }}>
                            {!cameraStarted && !capturedImage && (
                                <div className="bg-gray-200 flex justify-center items-center w-full h-full text-gray-500">
                                    Camera preview will appear here
                                </div>
                            )}
                            {cameraStarted && (
                                <Webcam
                                    className="bg-gray-200 w-full h-full object-contain"
                                    audio={false}
                                    ref={videoElement}
                                    screenshotFormat="image/jpeg"
                                />
                            )}
                            {!cameraStarted && capturedImage && (
                                <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                            )}
                        </div>

                        {/* Start Camera Button */}
                        {!cameraStarted && (!capturedImage || photoCaptured) && (
                            <button
                                className="bg-green-500 w-full text-white rounded-sm p-2 hover:bg-green-600"
                                onClick={handleStartCamera}
                            >
                                Start Camera
                            </button>
                        )}

                        {/* Capture + Stop Buttons */}
                        {cameraStarted && (
                            <div className="flex flex-row gap-2">
                                <button
                                    className="flex-1 bg-yellow-500 text-white rounded-sm p-2 hover:bg-yellow-600"
                                    onClick={handleCapture}
                                >
                                    Capture Photo
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 rounded-sm p-2 hover:bg-red-600"
                                    onClick={handleStopCamera}
                                >
                                    Stop Camera
                                </button>
                            </div>
                        )}

                        {/* Retake + Accept Buttons */}
                        {!cameraStarted && capturedImage && !photoCaptured && (
                            <div className="flex flex-row gap-2 mt-2">
                                <button
                                    className="flex-1 bg-gray-300 text-black rounded-sm p-2 hover:bg-gray-400"
                                    onClick={handleRetake}
                                >
                                    Retake
                                </button>
                                <button
                                    className="bg-blue-500 text-white px-4 rounded-sm p-2 hover:bg-blue-600"
                                    onClick={handleAcceptImage}
                                >
                                    Accept Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button className="bg-blue-500 w-full mt-4 text-white rounded-sm p-2 hover:bg-blue-600">
                        Complete Packing
                    </button>
                </div>
            </div>
        </Layout>     
    )
}
