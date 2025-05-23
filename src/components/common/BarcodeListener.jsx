import React, { useEffect, useState } from 'react';

const BarcodeListener = ({ onScan }) => {
  const [buffer, setBuffer] = useState('');
  const [lastTime, setLastTime] = useState(Date.now());

  useEffect(() => {
    const handleKeydown = (e) => {
      const now = Date.now();
      const timeDiff = now - lastTime;

      // If delay too long, reset buffer
      if (timeDiff > 100) setBuffer('');

      // Usually Enter means scan complete
      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          onScan(buffer); // Trigger your search or handler
          setBuffer('');
        }
      } else {
        setBuffer((prev) => prev + e.key);
      }

      setLastTime(now);
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [buffer, lastTime, onScan]);

  return null; // This component doesn't render anything
};

export default BarcodeListener;
