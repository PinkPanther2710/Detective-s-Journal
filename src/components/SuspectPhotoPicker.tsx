import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GENERIC_SUSPECT_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
];

interface SuspectPhotoPickerProps {
  onSelect: (photoUrl: string) => void;
  onClose: () => void;
}

export default function SuspectPhotoPicker({ onSelect, onClose }: SuspectPhotoPickerProps) {
  const [mode, setMode] = useState<'gallery' | 'camera'>('gallery');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col"
    >
      <div className="p-4 flex justify-between items-center border-b border-detective-accent/30">
        <h2 className="text-xl font-bold text-detective-paper typewriter uppercase">Identificação de Suspeito</h2>
        <button onClick={onClose} className="p-2 text-detective-paper"><X size={24} /></button>
      </div>

      <div className="flex border-b border-detective-accent/10">
        <button 
          onClick={() => setMode('gallery')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest transition-all ${mode === 'gallery' ? 'bg-detective-accent text-white' : 'text-detective-paper/40'}`}
        >
          <ImageIcon size={16} />
          Galeria
        </button>
        <button 
          onClick={() => setMode('camera')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest transition-all ${mode === 'camera' ? 'bg-detective-accent text-white' : 'text-detective-paper/40'}`}
        >
          <Camera size={16} />
          Câmera
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {mode === 'gallery' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {GENERIC_SUSPECT_PHOTOS.map((photo, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { onSelect(photo); onClose(); }}
                className="relative aspect-square rounded-sm overflow-hidden border-2 border-detective-paper/10 hover:border-detective-accent transition-all"
              >
                <img src={photo} alt={`Suspect ${index}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            {!capturedPhoto ? (
              <div className="relative w-full max-w-sm aspect-square bg-black rounded-sm overflow-hidden border-4 border-detective-paper/20">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                  <button 
                    onClick={takePhoto}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-full bg-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm space-y-6">
                <img src={capturedPhoto} alt="Captured" className="w-full aspect-square object-cover rounded-sm border-4 border-detective-accent shadow-2xl grayscale" />
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setCapturedPhoto(null); startCamera(); }}
                    className="flex-1 py-3 bg-detective-paper/10 text-detective-paper font-bold uppercase text-xs flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refazer
                  </button>
                  <button 
                    onClick={() => { onSelect(capturedPhoto); onClose(); }}
                    className="flex-1 py-3 bg-detective-accent text-white font-bold uppercase text-xs flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Usar Foto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
