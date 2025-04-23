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
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg lg:max-w-2xl p-4 relative">
        <h2 className="text-xl font-semibold text-center mb-4">Capture Photo</h2>

        <div className="w-full aspect-[4/3] bg-gray-200 rounded-md overflow-hidden mb-4">
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
        <div className="flex flex-col gap-2">
          {cameraStarted ? (
            <button
              onClick={handleCapture}
              className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
            >
              Take Photo
            </button>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
              >
                Retake
              </button>
              <button
                onClick={handleAccept}
                className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Confirm & Upload
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
