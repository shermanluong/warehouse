import React, {useState, useEffect, useRef} from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import Webcam from "react-webcam";

const PackingList = () => {
    const [isScanningPreview, setIsScanningPreview] = useState(false);
    const [barcode, setBarcode] = useState("");
    const isScanning = useRef(false);
    const [isButtonScanning, setIsButtonScanning] = useState(false);
    const [cameraStarted, setCameraStarted] = useState(false);

    const videoElement = useRef(null);
    const videoConstraints = {
        width: 320,
        height: 240,
        facingMode: "user"
    }

    const handleScan = (err, result)=> {
        if (isScanning.current) {
            if (result) {
                setBarcode(result.text);
            }
            else setBarcode("Not Found");
        } else {
            setBarcode("Not Found");
        }
    };

    const handleStartCamera = () => {
        setCameraStarted(true);
    };

    const handleStopCamera = () => {
        setCameraStarted(false);
    };

    return (
        <div className="bg-white p-4 rounded-sm shadow-md">
            {/* Second line: Search input and button */}
            <div className="flex flex-row mb-4 justify-between">
                <h3 className="font-semibold text-xl">Order #ORD-9122</h3>
                <button className="px-4 rounded-md hover:bg-blue-300">
                    Back to list
                </button>
            </div>

            <div className="flex flex-row mb-4 justify-between">
                <p>Customer: Customer bps</p>
                <div className="bg-green-400 text-sm px-2 rounded-xl">4items</div>
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
                {Array(3).fill().map((_, index) => (
                <div key={index} className="border border-gray-300 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">Card {index + 6}</h3>
                    <p className="text-gray-600">Some content for card {index + 6}</p>
                </div>
                ))}
            </div>
            
            {/* Capture Packing Photo Section */}
            <div className="mt-2 mb-4">
                <p className="font-semibold text-lg">Capture Packing Photo</p>

                <div className="relative w-full h-64 bg-gray-200 mb-4">
                    {!cameraStarted ? (
                        <div className="flex justify-center items-center w-full h-full text-gray-500">
                            Camera preview will appear here
                        </div>
                    ) : (
                        <Webcam
                            className="absolute inset-0 object-constain" 
                            audio={false} 
                            ref={videoElement} 
                            videoConstraints={videoConstraints} />
                    )}
                </div>

                {!cameraStarted ? (
                <button
                    className="bg-green-500 w-full text-white rounded-sm p-2"
                    onClick={handleStartCamera}
                >
                    Start Camera
                </button>
                ) : (
                <button
                    className="bg-red-500 w-full text-white rounded-sm p-2"
                    onClick={handleStopCamera}
                >
                    Stop Camera
                </button>
                )}
            </div>
                
            <button className="bg-blue-500 w-full mt-4 text-white rounded-sm p-2">
                Complete Packing
            </button>
        </div>
    );
};

export default PackingList;