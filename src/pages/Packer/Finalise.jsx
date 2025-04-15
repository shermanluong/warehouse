import Layout from '../../layouts/layout';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
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

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchOrder = async () => {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/packer/order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setOrder(res?.data || null);
          setLineItems(res?.data?.lineItems);
          console.log(res?.data);
        };
        fetchOrder();
    }, [id]);

    const handleScan = (err, result) => {
        if (isScanning.current) {
            if (result) setBarcode(result.text);
            else setBarcode("Not Found");
        } else {
            setBarcode("Not Found");
        }
    };

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

    return (
        <Layout headerTitle={"Packing"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Your content */}
                <div className="bg-white p-4 rounded-sm shadow-md">
                    {/* Header */}
                    <div className="flex flex-row mb-4 justify-between">
                        <h3 className="font-semibold text-xl">Order #{order?.shopifyOrderId}</h3>
                        <button 
                            onClick={() => navigate(`/packer/orders`)}
                            className="px-4 rounded-md hover:bg-blue-300"
                        >
                            Back to list
                        </button>
                    </div>

                    <div className="flex flex-row mb-4 justify-between">
                        <p>Customer: Customer bps</p>
                        <div className="bg-green-400 text-sm px-2 rounded-xl">4 items</div>
                    </div>

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
                                    Manual Scan
                                </button>
                                <button
                                    className="border border-gray-400 bg-white p-2 px-4 rounded-md hover:bg-blue-400"
                                    onClick={() => setIsScanningPreview(true)}
                                >
                                    Scan
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
                                    className={`flex-1 text-white rounded-md p-2 ${
                                        isScanning.current ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                    onClick={() => {
                                        isScanning.current = !isScanning.current;
                                        setIsButtonScanning(!isButtonScanning);
                                    }}
                                >
                                    {isScanning.current ? "Stop Scanner" : "Start Scanner"}
                                </button>
                                <button
                                    className="border border-gray-400 px-4 rounded-md hover:bg-blue-400"
                                    onClick={() => setIsScanningPreview(false)}
                                >
                                    Manual Entry
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
                            <div
                            key={lineItem.variantId}
                            className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 rounded-lg p-4 shadow-md"
                            >
                                {/* Left side: image + name + SKU */}
                                <div className="flex items-start sm:items-center">
                                    <img
                                    src={lineItem?.photoImg}
                                    alt={lineItem?.name}
                                    className="w-16 h-16 rounded object-cover"
                                    />
                                    <div className="ml-4 mt-2 sm:mt-0">
                                    <h3 className="font-semibold text-gray-900">{lineItem?.name}</h3>
                                    <p className="text-sm text-gray-500">SKU: {lineItem?.sku}</p>
                                    </div>
                                </div>

                                {lineItem.packed ? (
                                    <span className="text-green-600">✅ Verified</span>
                                ) : (
                                    <div className="flex items-center  sm:justify-end mt-4 sm:mt-0 space-x-3">
                                        <span className="flex-1 text-sm text-gray-700 whitespace-nowrap">
                                        0 packed / {lineItem.quantity} units
                                        </span>
                                        <button 
                                            onClick={() => handlePick(lineItem.productId)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                                        >
                                            ✓
                                        </button>
                                    </div>
                                )}
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
