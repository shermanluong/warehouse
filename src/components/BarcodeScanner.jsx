import React, { useState, useRef } from 'react';
import { PencilSquareIcon, CameraIcon } from '@heroicons/react/24/outline';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const BarcodeScanner = ({onScan}) => {
    const [isScanningPreview, setIsScanningPreview] = useState(false);
    const [isButtonScanning, setIsButtonScanning] = useState(false);
    const isScanning = useRef(false);
    const [barcode, setBarcode] = useState('');

    const handleScan = (err, result) => {
        if (result?.text && isScanning.current) {
            setBarcode(result.text);
            isScanning.current = false;
            setIsButtonScanning(false);
            onScan(result.text);
        }
    };

    return (
        <>
            {!isScanningPreview && ( 
                <div className="flex space-x-2 mb-3">
                    <input
                        type="text"
                        placeholder="Type item barcode"
                        className="flex-1 border border-gray-300 rounded-md p-2 mb-0"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                    />
                   
                    <button 
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                        onClick={() => OnScan(barcode)}
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button 
                        className="border border-gray-500 bg-white p-2 px-4 rounded-md hover:bg-gray-600"
                        onClick={() => setIsScanningPreview(true)}
                    >
                        <CameraIcon className="w-5 h-5" />
                    </button>
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
        </>
    );
};

export default BarcodeScanner;
