import React, { useState, useEffect } from 'react';
import { Camera, QrCode, BookOpen, AlertCircle, ShieldCheck, MessageSquare, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CameraCapture from './components/CameraCapture';
import QRScanner from './components/QRScanner';
import ClueGallery from './components/ClueGallery';
import ChatScreen from './components/ChatScreen';
import SuspectsScreen from './components/SuspectsScreen';
import NotesScreen from './components/NotesScreen';
import { Clue, Suspect, Note } from './types';

export default function App() {
  const [clues, setClues] = useState<Clue[]>([]);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeView, setActiveView] = useState<'gallery' | 'camera' | 'qr' | 'chat' | 'suspects' | 'notes'>('gallery');
  const [showUnlockAlert, setShowUnlockAlert] = useState<{ title: string; message: string } | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedClues = localStorage.getItem('detective_clues');
    const savedSuspects = localStorage.getItem('detective_suspects');
    const savedNotes = localStorage.getItem('detective_notes');
    
    if (savedClues) {
      try {
        setClues(JSON.parse(savedClues));
      } catch (e) {
        console.error("Failed to parse saved clues", e);
      }
    }
    if (savedSuspects) {
      try {
        setSuspects(JSON.parse(savedSuspects));
      } catch (e) {
        console.error("Failed to parse saved suspects", e);
      }
    }
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('detective_clues', JSON.stringify(clues));
    localStorage.setItem('detective_suspects', JSON.stringify(suspects));
    localStorage.setItem('detective_notes', JSON.stringify(notes));
  }, [clues, suspects, notes]);

  const handleAddClue = (newClue: Omit<Clue, 'id' | 'timestamp' | 'type'>) => {
    const clue: Clue = {
      ...newClue,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: 'manual'
    };
    setClues([clue, ...clues]);
    setActiveView('gallery');
  };

  const handleQRScan = (decodedText: string) => {
    let title = "Mensagem Descriptografada";
    let message = decodedText;

    if (decodedText.toLowerCase().includes('treasure') || decodedText.toLowerCase().includes('pista')) {
      title = "EVIDÊNCIA CRÍTICA DESBLOQUEADA!";
      message = "Você encontrou uma peça chave do quebra-cabeça. Verifique sua galeria.";
    }

    const clue: Clue = {
      id: crypto.randomUUID(),
      title: title,
      description: decodedText,
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
      timestamp: Date.now(),
      type: 'qr'
    };

    setClues([clue, ...clues]);
    setShowUnlockAlert({ title, message });
    setActiveView('gallery');
  };

  const handleDeleteClue = (id: string) => {
    setClues(clues.filter(c => c.id !== id));
    setSuspects(suspects.map(s => ({
      ...s,
      linkedClueIds: s.linkedClueIds.filter(cid => cid !== id)
    })));
  };

  const handleAddSuspect = (newSuspect: Omit<Suspect, 'id' | 'timestamp'>) => {
    const suspect: Suspect = {
      ...newSuspect,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setSuspects([suspect, ...suspects]);
  };

  const handleUpdateSuspect = (updatedSuspect: Suspect) => {
    setSuspects(suspects.map(s => s.id === updatedSuspect.id ? updatedSuspect : s));
  };

  const handleDeleteSuspect = (id: string) => {
    setSuspects(suspects.filter(s => s.id !== id));
  };

  const handleAddNote = (text: string) => {
    const note: Note = {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now()
    };
    setNotes([note, ...notes]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'chat': return 'COMUNICAÇÕES QG';
      case 'suspects': return 'DOSSIÊ DE SUSPEITOS';
      case 'notes': return 'DIÁRIO DE BORDO';
      default: return 'DIÁRIO DE INVESTIGAÇÃO';
    }
  };

  const getHeaderSubtitle = () => {
    switch (activeView) {
      case 'chat': return 'Linha Direta com o Especialista';
      case 'suspects': return 'Arquivos Confidenciais';
      case 'notes': return 'Notas de Campo Rápidas';
      default: return 'Informação Confidencial • Caso #882-X';
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto border-x border-detective-accent/20 shadow-2xl bg-detective-dark">
      {/* Header */}
      <header className="p-6 border-b border-detective-accent/30 bg-detective-dark/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-detective-paper typewriter flex items-center gap-2">
              <ShieldCheck className="text-detective-accent" />
              {getHeaderTitle()}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-detective-accent font-bold mt-1">
              {getHeaderSubtitle()}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs typewriter opacity-60">EVIDÊNCIAS</span>
            <div className="text-xl font-bold text-detective-accent">{clues.length}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-32 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto"
            >
              <ClueGallery clues={clues} onDelete={handleDeleteClue} />
            </motion.div>
          )}
          
          {activeView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ChatScreen clues={clues} suspects={suspects} />
            </motion.div>
          )}

          {activeView === 'suspects' && (
            <motion.div
              key="suspects"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full overflow-y-auto"
            >
              <SuspectsScreen 
                suspects={suspects} 
                clues={clues} 
                onAddSuspect={handleAddSuspect}
                onUpdateSuspect={handleUpdateSuspect}
                onDeleteSuspect={handleDeleteSuspect}
              />
            </motion.div>
          )}

          {activeView === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full overflow-y-auto"
            >
              <NotesScreen 
                notes={notes} 
                onAddNote={handleAddNote} 
                onDeleteNote={handleDeleteNote} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto p-6 bg-gradient-to-t from-detective-dark via-detective-dark to-transparent pointer-events-none">
        <div className="flex justify-center items-center gap-2 pointer-events-auto">
          <button 
            onClick={() => setActiveView('gallery')}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-2 ${
              activeView === 'gallery' ? 'bg-detective-accent text-white border-detective-paper' : 'bg-detective-paper text-detective-ink border-detective-accent/30'
            }`}
            title="Ver Diário"
          >
            <BookOpen size={18} />
          </button>

          <button 
            onClick={() => setActiveView('suspects')}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-2 ${
              activeView === 'suspects' ? 'bg-detective-accent text-white border-detective-paper' : 'bg-detective-paper text-detective-ink border-detective-accent/30'
            }`}
            title="Dossiê de Suspeitos"
          >
            <Users size={18} />
          </button>

          <button 
            onClick={() => setActiveView('camera')}
            className="w-16 h-16 rounded-full bg-detective-accent text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-detective-paper/20"
            title="Capturar Evidência"
          >
            <Camera size={24} />
          </button>

          <button 
            onClick={() => setActiveView('chat')}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-2 ${
              activeView === 'chat' ? 'bg-detective-accent text-white border-detective-paper' : 'bg-detective-paper text-detective-ink border-detective-accent/30'
            }`}
            title="Conversar com Especialista"
          >
            <MessageSquare size={18} />
          </button>

          <button 
            onClick={() => setActiveView('notes')}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-2 ${
              activeView === 'notes' ? 'bg-detective-accent text-white border-detective-paper' : 'bg-detective-paper text-detective-ink border-detective-accent/30'
            }`}
            title="Diário de Bordo"
          >
            <FileText size={18} />
          </button>
          
          <button 
            onClick={() => setActiveView('qr')}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-2 ${
              activeView === 'qr' ? 'bg-detective-accent text-white border-detective-paper' : 'bg-detective-paper text-detective-ink border-detective-accent/30'
            }`}
            title="Escanear QR Code"
          >
            <QrCode size={18} />
          </button>
        </div>
      </nav>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {activeView === 'camera' && (
          <CameraCapture 
            onCapture={handleAddClue} 
            onClose={() => setActiveView('gallery')} 
          />
        )}
        
        {activeView === 'qr' && (
          <QRScanner 
            onScan={handleQRScan} 
            onClose={() => setActiveView('gallery')} 
          />
        )}

        {showUnlockAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="paper-texture p-8 rounded-sm shadow-2xl max-w-sm w-full border-4 border-detective-accent"
            >
              <div className="flex items-center gap-3 text-detective-accent mb-4">
                <AlertCircle size={32} />
                <h3 className="text-xl font-bold typewriter uppercase">{showUnlockAlert.title}</h3>
              </div>
              <p className="typewriter text-sm mb-6 leading-relaxed">
                {showUnlockAlert.message}
              </p>
              <button 
                onClick={() => setShowUnlockAlert(null)}
                className="w-full py-3 bg-detective-ink text-white font-bold uppercase tracking-widest text-xs hover:bg-detective-accent transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[60] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}
