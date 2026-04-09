import React, { useState } from 'react';
import { UserPlus, User, Shield, AlertTriangle, CheckCircle, X, Link as LinkIcon, Plus, Trash2, Camera, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Suspect, Clue, SuspectStatus } from '../types';
import SuspectPhotoPicker from './SuspectPhotoPicker';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface SuspectsScreenProps {
  suspects: Suspect[];
  clues: Clue[];
  onAddSuspect: (suspect: Omit<Suspect, 'id' | 'timestamp'>) => void;
  onUpdateSuspect: (suspect: Suspect) => void;
  onDeleteSuspect: (id: string) => void;
}

export default function SuspectsScreen({ suspects, clues, onAddSuspect, onUpdateSuspect, onDeleteSuspect }: SuspectsScreenProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [bioKeywords, setBioKeywords] = useState('');
  const [photoTarget, setPhotoTarget] = useState<'new' | 'edit'>('new');
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [newSuspect, setNewSuspect] = useState<Partial<Suspect>>({
    name: '',
    alias: '',
    status: 'Em Observação',
    bio: '',
    observations: '',
    linkedClueIds: [],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
  });

  const getStatusColor = (status: SuspectStatus) => {
    switch (status) {
      case 'Principal Suspeito': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'Álibi Confirmado': return 'text-green-500 border-green-500/30 bg-green-500/10';
      default: return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
    }
  };

  const getStatusIcon = (status: SuspectStatus) => {
    switch (status) {
      case 'Principal Suspeito': return <AlertTriangle size={14} />;
      case 'Álibi Confirmado': return <CheckCircle size={14} />;
      default: return <Shield size={14} />;
    }
  };

  const handleAdd = () => {
    if (newSuspect.name) {
      onAddSuspect(newSuspect as Omit<Suspect, 'id' | 'timestamp'>);
      setIsAdding(false);
      setBioKeywords('');
      setNewSuspect({
        name: '',
        alias: '',
        status: 'Em Observação',
        bio: '',
        observations: '',
        linkedClueIds: [],
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
      });
    }
  };

  const handleGenerateBio = async () => {
    if (!bioKeywords.trim()) return;

    setIsGeneratingBio(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gere uma biografia detalhada e imersiva para um suspeito de um crime em um jogo de investigação. 
        O tom deve ser profissional, como um relatório policial ou dossiê confidencial. 
        Use as seguintes palavras-chave: ${bioKeywords}. 
        O idioma deve ser Português (Brasil). Seja conciso mas detalhado (máximo 3 parágrafos).`,
      });

      if (response.text) {
        setNewSuspect(prev => ({ ...prev, bio: response.text }));
      }
    } catch (error) {
      console.error("Erro ao gerar biografia:", error);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handlePhotoSelect = (photoUrl: string) => {
    if (photoTarget === 'new') {
      setNewSuspect({ ...newSuspect, photo: photoUrl });
    } else if (photoTarget === 'edit' && selectedSuspect) {
      const updated = { ...selectedSuspect, photo: photoUrl };
      setSelectedSuspect(updated);
      onUpdateSuspect(updated);
    }
  };

  const toggleClueLink = (suspect: Suspect, clueId: string) => {
    const isLinked = suspect.linkedClueIds.includes(clueId);
    const updatedLinkedClueIds = isLinked
      ? suspect.linkedClueIds.filter(id => id !== clueId)
      : [...suspect.linkedClueIds, clueId];
    
    onUpdateSuspect({ ...suspect, linkedClueIds: updatedLinkedClueIds });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold typewriter uppercase text-detective-paper">Dossiê de Suspeitos</h2>
        <button 
          onClick={() => {
            setPhotoTarget('new');
            setIsAdding(true);
          }}
          className="p-2 bg-detective-accent text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
        >
          <UserPlus size={20} />
        </button>
      </div>

      {suspects.length === 0 ? (
        <div className="py-20 text-center opacity-40">
          <User size={64} className="mx-auto mb-4" />
          <p className="typewriter">Nenhum suspeito fichado no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {suspects.map((suspect) => (
            <motion.div
              key={suspect.id}
              layoutId={suspect.id}
              onClick={() => setSelectedSuspect(suspect)}
              className="paper-texture p-4 rounded-sm border-l-4 border-detective-accent flex gap-4 cursor-pointer hover:brightness-110 transition-all"
            >
              <img 
                src={suspect.photo} 
                alt={suspect.name} 
                className="w-20 h-20 object-cover rounded-sm grayscale border border-detective-ink/20"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg typewriter uppercase leading-tight">{suspect.name}</h3>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold uppercase ${getStatusColor(suspect.status)}`}>
                    {getStatusIcon(suspect.status)}
                    {suspect.status}
                  </div>
                </div>
                <p className="text-xs typewriter opacity-60 mb-2">Vulgo: {suspect.alias || 'N/A'}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-40">
                  <LinkIcon size={10} />
                  {suspect.linkedClueIds.length} Pistas Vinculadas
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Suspect Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="paper-texture w-full max-w-md p-6 rounded-sm shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold typewriter uppercase">Fichar Novo Suspeito</h3>
                <button onClick={() => setIsAdding(false)} className="text-detective-ink/40"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative group cursor-pointer" onClick={() => { setPhotoTarget('new'); setIsPickingPhoto(true); }}>
                    <img 
                      src={newSuspect.photo} 
                      className="w-32 h-32 object-cover rounded-sm grayscale border-2 border-detective-accent shadow-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-detective-accent p-1.5 rounded-full text-white shadow-lg">
                      <Camera size={14} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Nome Completo</label>
                  <input 
                    type="text"
                    value={newSuspect.name}
                    onChange={e => setNewSuspect({...newSuspect, name: e.target.value})}
                    className="w-full bg-transparent border-b border-detective-ink/30 p-2 typewriter outline-none focus:border-detective-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Alcunha / Vulgo</label>
                  <input 
                    type="text"
                    value={newSuspect.alias}
                    onChange={e => setNewSuspect({...newSuspect, alias: e.target.value})}
                    className="w-full bg-transparent border-b border-detective-ink/30 p-2 typewriter outline-none focus:border-detective-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Status Inicial</label>
                  <select 
                    value={newSuspect.status}
                    onChange={e => setNewSuspect({...newSuspect, status: e.target.value as SuspectStatus})}
                    className="w-full bg-transparent border-b border-detective-ink/30 p-2 typewriter outline-none focus:border-detective-accent"
                  >
                    <option value="Em Observação">Em Observação</option>
                    <option value="Álibi Confirmado">Álibi Confirmado</option>
                    <option value="Principal Suspeito">Principal Suspeito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Palavras-chave para Biografia (IA)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={bioKeywords}
                      onChange={e => setBioKeywords(e.target.value)}
                      placeholder="ex: ex-militar, nervoso, cicatriz..."
                      className="flex-1 bg-transparent border-b border-detective-ink/30 p-2 typewriter outline-none focus:border-detective-accent text-sm"
                    />
                    <button 
                      onClick={handleGenerateBio}
                      disabled={isGeneratingBio || !bioKeywords.trim()}
                      className="p-2 bg-detective-accent text-white rounded-sm shadow-md disabled:opacity-50 flex items-center justify-center"
                      title="Gerar Biografia com IA"
                    >
                      {isGeneratingBio ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Biografia / Antecedentes</label>
                  <textarea 
                    value={newSuspect.bio}
                    onChange={e => setNewSuspect({...newSuspect, bio: e.target.value})}
                    rows={3}
                    className="w-full bg-transparent border-b border-detective-ink/30 p-2 typewriter outline-none focus:border-detective-accent text-sm"
                  />
                </div>
                <button 
                  onClick={handleAdd}
                  disabled={!newSuspect.name}
                  className="w-full py-3 bg-detective-accent text-white font-bold uppercase tracking-widest text-xs mt-4 disabled:opacity-50"
                >
                  Confirmar Fichamento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspect Detail Modal */}
      <AnimatePresence>
        {selectedSuspect && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-detective-accent/30">
              <h2 className="text-xl font-bold text-detective-paper typewriter uppercase">Dossiê Confidencial</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if(confirm('Deseja realmente apagar este dossiê?')) {
                      onDeleteSuspect(selectedSuspect.id);
                      setSelectedSuspect(null);
                    }
                  }}
                  className="p-2 text-red-500/50 hover:text-red-500"
                >
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setSelectedSuspect(null)} className="p-2 text-detective-paper"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative group cursor-pointer w-full md:w-48 aspect-square" onClick={() => { setPhotoTarget('edit'); setIsPickingPhoto(true); }}>
                  <img 
                    src={selectedSuspect.photo} 
                    alt={selectedSuspect.name} 
                    className="w-full h-full object-cover rounded-sm grayscale border-4 border-detective-paper/20 shadow-2xl group-hover:border-detective-accent transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={32} />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-detective-accent p-2 rounded-full text-white shadow-lg">
                    <Camera size={18} />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold typewriter uppercase leading-none">{selectedSuspect.name}</h3>
                    <p className="text-detective-accent font-bold typewriter mt-1">VULGO: {selectedSuspect.alias || 'N/A'}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {(['Em Observação', 'Álibi Confirmado', 'Principal Suspeito'] as SuspectStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => onUpdateSuspect({ ...selectedSuspect, status })}
                        className={`text-[10px] px-3 py-1 rounded-full border font-bold uppercase transition-all ${
                          selectedSuspect.status === status 
                            ? getStatusColor(status) 
                            : 'border-detective-paper/10 text-detective-paper/30'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <section className="paper-texture p-6 rounded-sm shadow-lg">
                    <h4 className="text-xs font-bold uppercase tracking-widest border-b border-detective-ink/10 pb-2 mb-4">Biografia / Antecedentes</h4>
                    <p className="typewriter text-sm leading-relaxed">{selectedSuspect.bio || 'Sem registros prévios.'}</p>
                  </section>

                  <section className="paper-texture p-6 rounded-sm shadow-lg">
                    <h4 className="text-xs font-bold uppercase tracking-widest border-b border-detective-ink/10 pb-2 mb-4">Observações de Comportamento</h4>
                    <textarea 
                      value={selectedSuspect.observations}
                      onChange={e => onUpdateSuspect({ ...selectedSuspect, observations: e.target.value })}
                      placeholder="Anote comportamentos suspeitos, contradições..."
                      rows={4}
                      className="w-full bg-transparent typewriter text-sm outline-none resize-none"
                    />
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="paper-texture p-6 rounded-sm shadow-lg">
                    <h4 className="text-xs font-bold uppercase tracking-widest border-b border-detective-ink/10 pb-2 mb-4">Pistas Vinculadas</h4>
                    {clues.length === 0 ? (
                      <p className="text-[10px] typewriter opacity-40 italic">Nenhuma pista disponível para vincular.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {clues.map(clue => (
                          <button
                            key={clue.id}
                            onClick={() => toggleClueLink(selectedSuspect, clue.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-sm border transition-all text-left ${
                              selectedSuspect.linkedClueIds.includes(clue.id)
                                ? 'bg-detective-accent/10 border-detective-accent text-detective-ink'
                                : 'border-detective-ink/10 text-detective-ink/40 grayscale'
                            }`}
                          >
                            <img src={clue.image} className="w-10 h-10 object-cover rounded-sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold typewriter truncate uppercase">{clue.title}</p>
                              <p className="text-[8px] typewriter truncate opacity-60">{clue.description}</p>
                            </div>
                            {selectedSuspect.linkedClueIds.includes(clue.id) ? <CheckCircle size={14} className="text-detective-accent" /> : <Plus size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Picker Overlay */}
      <AnimatePresence>
        {isPickingPhoto && (
          <SuspectPhotoPicker 
            onSelect={handlePhotoSelect}
            onClose={() => setIsPickingPhoto(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
