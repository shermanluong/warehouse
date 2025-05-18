import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

export default function CameraModal({ isOpen, onClose, onCaptureComplete }) {
  const webcamRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Reset modal state when it opens
      setCapturedImage(null);
      setCameraStarted(true);
    }
  }, [isOpen]);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setCameraStarted(false);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCameraStarted(true);
  };

  const handleAccept = () => {
    onCaptureComplete(capturedImage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl p-8 relative">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-green-900">Capture Photo</h2>
  
        <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden mb-8 flex items-center justify-center border-4 border-blue-200">
          {cameraStarted && (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
          )}
          {!cameraStarted && capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
          )}
        </div>
  
        {/* Buttons */}
        <div className="flex flex-col gap-4">
          {cameraStarted ? (
            <button
              onClick={handleCapture}
              className="text-2xl font-bold bg-yellow-500 text-white py-4 rounded-xl shadow hover:bg-yellow-600 transition"
            >
              📸 Take Photo
            </button>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="text-2xl font-bold bg-gray-400 text-white py-4 rounded-xl shadow hover:bg-gray-500 transition"
              >
                🔄 Retake
              </button>
              <button
                onClick={handleAccept}
                className="text-2xl font-bold bg-blue-600 text-white py-4 rounded-xl shadow hover:bg-blue-800 transition"
              >
                ✅ Confirm & Upload
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="text-2xl font-bold bg-red-600 text-white py-4 rounded-xl shadow hover:bg-red-800 transition"
          >
            ✖ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
