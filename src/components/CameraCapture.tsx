import React, { useState, useRef } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Clue } from '../types';

interface CameraCaptureProps {
  onCapture: (clue: Omit<Clue, 'id' | 'timestamp' | 'type'>) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
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
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSave = () => {
    if (photo && title) {
      onCapture({ title, description, image: photo });
      onClose();
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="p-4 flex justify-between items-center bg-detective-dark border-b border-detective-accent/30">
        <h2 className="text-xl font-bold text-detective-paper typewriter">NOVA EVIDÊNCIA</h2>
        <button onClick={onClose} className="p-2 text-detective-paper hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {!photo ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <button 
                onClick={takePhoto}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col p-6 bg-detective-dark overflow-y-auto">
            <div className="relative mb-6">
              <img src={photo} alt="Captured" className="w-full rounded-lg border-2 border-detective-accent/50 shadow-2xl" />
              <button 
                onClick={() => { setPhoto(null); startCamera(); }}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="space-y-4 paper-texture p-6 rounded-sm shadow-inner">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Título da Evidência</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="O que você encontrou?"
                  className="w-full bg-transparent border-b-2 border-detective-ink/30 focus:border-detective-accent outline-none py-2 typewriter text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Descrição</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva os detalhes..."
                  rows={3}
                  className="w-full bg-transparent border-b-2 border-detective-ink/30 focus:border-detective-accent outline-none py-2 typewriter"
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={!title}
                className="w-full py-3 bg-detective-accent text-white font-bold rounded-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                ARQUIVAR EVIDÊNCIA
              </button>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
