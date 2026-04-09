import React from 'react';
import { Search, FileText, Clock, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Clue } from '../types';

interface ClueGalleryProps {
  clues: Clue[];
  onDelete: (id: string) => void;
}

export default function ClueGallery({ clues, onDelete }: ClueGalleryProps) {
  if (clues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <Search size={64} className="mb-4" />
        <p className="typewriter text-center px-10">Nenhuma evidência coletada ainda. O rastro está frio...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {clues.map((clue, index) => (
        <motion.div
          key={clue.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="clue-card paper-texture rounded-sm flex flex-col"
        >
          <div className="relative aspect-video overflow-hidden border-b-2 border-detective-ink/20">
            <img 
              src={clue.image} 
              alt={clue.title} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute top-2 left-2 bg-detective-accent text-white text-[10px] px-2 py-1 font-bold uppercase tracking-tighter">
              {clue.type === 'qr' ? 'DESCRIPTOGRAFADO' : 'EVIDÊNCIA'} #{clues.length - index}
            </div>
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl typewriter uppercase leading-tight">{clue.title}</h3>
              <button 
                onClick={() => onDelete(clue.id)}
                className="text-detective-ink/40 hover:text-red-700 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <p className="text-sm typewriter mb-4 flex-1 line-clamp-3">
              {clue.description}
            </p>
            
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-detective-ink/60 border-t border-detective-ink/10 pt-3">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(clue.timestamp).toLocaleDateString()} {new Date(clue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-1">
                <FileText size={12} />
                ARQUIVO: {clue.id.slice(0, 8)}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-detective-accent/10 rounded-full blur-xl" />
        </motion.div>
      ))}
    </div>
  );
}
