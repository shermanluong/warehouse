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
          {/* Manual barcode entry */}
          {!isScanningPreview && ( 
            <div className="flex space-x-3 mb-4">
              <input
                type="text"
                placeholder="Type item barcode"
                className="flex-1 border-2 border-blue-300 rounded-xl p-3 text-lg"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
              <button 
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-800 flex items-center justify-center"
                onClick={() => onScan(barcode)}
                aria-label="Enter barcode"
              >
                <PencilSquareIcon className="w-7 h-7" />
              </button>
              <button 
                className="border-2 border-gray-400 bg-white p-3 rounded-xl hover:bg-gray-200 flex items-center justify-center"
                onClick={() => setIsScanningPreview(true)}
                aria-label="Scan barcode"
              >
                <CameraIcon className="w-7 h-7" />
              </button>
            </div>
          )}
      
          {/* Camera/Scanner preview */}
          {isScanningPreview && (
            <>
              <div className="relative w-full h-64 bg-gray-200 mb-4 overflow-hidden flex justify-center items-center rounded-xl">
                <BarcodeScannerComponent
                  onUpdate={(err, result) => handleScan(err, result)}
                />
              </div>
              <div className="flex gap-3 mb-4">
                <button
                  className={`flex-1 text-white rounded-xl p-3 text-lg font-bold transition-all ${
                    isScanning.current ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-800"
                  }`}
                  onClick={() => {
                    isScanning.current = !isScanning.current;
                    setIsButtonScanning(!isButtonScanning);
                  }}
                >
                  {isScanning.current ? "Stop Scanner" : "Start Scanner"}
                </button>
                <button 
                  className="border-2 border-gray-400 p-3 rounded-xl bg-white hover:bg-gray-200 flex items-center justify-center"
                  onClick={() => setIsScanningPreview(false)}
                  aria-label="Manual entry"
                >
                  <PencilSquareIcon className="w-7 h-7" />
                </button>
              </div>
            </>
          )}
        </>
    );
};

export default BarcodeScanner;
