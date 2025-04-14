import React, {useState, useEffect, useRef} from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import axios from 'axios';

const PickingList = ({ order }) => {
    const [lineItems, setLineItems] = useState(order.lineItems);
    const [isScanningPreview, setIsScanningPreview] = useState(false);
    const [barcode, setBarcode] = useState("");
    const isScanning = useRef(false);
    const [isButtonScanning, setIsButtonScanning] = useState(false);
    const [allPicked, setAllPicked] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        console.log('Received order in PickingList:', order);
    }, [order]);

    useEffect(() => {
        setAllPicked(lineItems.every(item => item.picked));
    }, [lineItems]);

    const handlePick = async (productId) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-item`,  { productId }, { headers: { Authorization: `Bearer ${token}` } });
            setLineItems(lineItems =>
                lineItems.map(item =>
                item.productId === productId ? { ...item, picked: true } : item
                )
            );
        } catch (err) {
            console.error('Failed to pick item', err);
        }
    };

    const handleScan = async (err, result)=> {
        if (isScanning.current) {
            if (result) {
                setBarcode(result.text);

                const res = await axios.patch(`${API_URL}/picker/order/${order._id}/scan`, { barcode });
                const updatedItem = res.data.item;
                setOrder(prev => ({
                ...prev,
                lineItems: prev.lineItems.map(item =>
                    item.variantId === barcode ? updatedItem : item
                )
                }));
            }
            else setBarcode("Not Found");
        } else {
            setBarcode("Not Found");
        }
    };

    const handleCompletePicking = async () => {
        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/picker/order/${order._id}/complete-picking`, { status: 'picked' }, { headers: { Authorization: `Bearer ${token}` } });
          console.log('Order marked as picked!');
        } catch (err) {
          console.error('Failed to complete picking', err);
        }
    };

    return (
        <div className="bg-white p-4 rounded-sm shadow-md">
            {/* Second line: Search input and button */}
            <div className="flex flex-row mb-4 justify-between">
                <h3 className="font-semibold text-xl">Order #{order?.shopifyOrderId}</h3>
                <button className="px-4 rounded-md hover:bg-blue-300">
                    Back to list
                </button>
            </div>

            <div className="flex flex-row mb-4 justify-between">
                <p>Customer: Customer bps</p>
                <div className="bg-green-400 text-sm px-2 rounded-xl">{order.lineItems.length} items</div>
            </div>

            {/* Scan input and button */}
            {!isScanningPreview && ( 
                <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
                    <input
                    type="text"
                    placeholder="Scan item barcode"
                    className="flex-1 border border-gray-300 rounded-md p-2 mb-4 sm:mb-0"
                    />
                    <div className="flex flex-row space-x-2">
                        <button 
                            className="flex-1 bg-blue-500 text-white p-2 px-4 rounded-md hover:bg-blue-600"
                            onClick={() => {
                            }}
                        >
                            Manual Scan
                        </button>
                        <button 
                            className="border border-gray-400 bg-white p-2 px-4 rounded-md hover:bg-blue-400"
                            onClick={() => {
                                setIsScanningPreview(true);
                            }}
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
                        className="border border-gray-400 px-4 rounded-md hover:bg-blue-400"
                        onClick={() => {
                            setIsScanningPreview(false);
                        }}
                    >
                        Manual Entry
                    </button>
                </div>
            </>
            )}

            {/* Display the Scanned Barcode */}
            <div>
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

                        {lineItem.picked ? (
                            <span className="text-green-600">✅ Verified</span>
                        ) : (
                            <div className="flex items-center  sm:justify-end mt-4 sm:mt-0 space-x-3">
                                <span className="flex-1 text-sm text-gray-700 whitespace-nowrap">
                                0 picked / {lineItem.quantity} units
                                </span>
                                <button 
                                    onClick={() => handlePick(lineItem.productId)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                                >
                                    ✓
                                </button>
                                <button className="border border-red-500 text-red-500 hover:bg-red-100 px-3 py-2 rounded">
                                ✕
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
    );
};

export default PickingList;