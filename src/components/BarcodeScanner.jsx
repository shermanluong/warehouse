import React, { useState, useRef } from 'react';
import { PencilSquareIcon, CameraIcon } from '@heroicons/react/24/outline';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const BarcodeScanner = () => {
    const [isScanningPreview, setIsScanningPreview] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [isButtonScanning, setIsButtonScanning] = useState(false);
    const isScanning = useRef(false);

    const handleScan = (err, result) => {
        if (result?.text && isScanning.current) {
            setBarcode(result.text);
            isScanning.current = false;
            setIsButtonScanning(false);
        }
    };

    return (
        <>
            {!isScanningPreview && ( 
                <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
                    <input
                        type="text"
                        placeholder="Type item barcode"
                        className="flex-1 border border-gray-300 rounded-md p-2 mb-4 sm:mb-0"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
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
                                isScanning.current ? "bg-red-500" : "bg-blue-500"
                            }`}
                            onClick={() => {
                                isScanning.current = !isScanning.current;
                                setIsButtonScanning(!isButtonScanning);
                            }}
                        >
                            {isScanning.current ? "Stop Scanner" : "Start Scanner"}
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

            <div>
                <p>Scanned Barcode: {barcode}</p>
            </div>
        </>
    );
};

export default BarcodeScanner;
