import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [onScan]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-detective-dark flex flex-col"
    >
      <div className="p-4 flex justify-between items-center border-b border-detective-accent/30">
        <div className="flex items-center gap-2">
          <QrCode className="text-detective-accent" />
          <h2 className="text-xl font-bold text-detective-paper typewriter">SCANNING CODE...</h2>
        </div>
        <button onClick={onClose} className="p-2 text-detective-paper hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div id="qr-reader" className="w-full max-w-md overflow-hidden rounded-lg border-4 border-detective-accent/50 shadow-2xl bg-black" />
        
        <div className="mt-8 paper-texture p-6 rounded-sm shadow-lg max-w-md w-full">
          <p className="typewriter text-sm leading-relaxed">
            Point the lens at the encrypted symbol. The system will automatically decrypt the hidden message.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
