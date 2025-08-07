import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScanner = ({ onScan }) => {
  const qrCodeRegionId = 'html5qr-code-full-region';
  const scannerRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const qrCodeScanner = new Html5Qrcode(qrCodeRegionId);
    scannerRef.current = qrCodeScanner;

    const stopScanner = () => {
      if (scannerRef.current && isRunning) {
        scannerRef.current.stop()
          .then(() => {
            console.log("Scanner stopped");
            setIsRunning(false);
          })
          .catch((err) => {
            console.error("Stop failed:", err);
          });
      }
    };

    qrCodeScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        console.log("QR Code detected:", decodedText);
        onScan(decodedText);
        stopScanner();
      },
      (error) => {
        // optional: handle scan error
      }
    ).then(() => {
      setIsRunning(true);
    }).catch((err) => {
      console.error("Start failed:", err);
    });

    return () => {
      stopScanner();
    };
  }, [onScan, isRunning]); // ✅ Added onScan & isRunning as dependencies

  return (
    <div>
      <div id={qrCodeRegionId} style={{ width: '100%' }} />
    </div>
  );
};

export default QrScanner;
