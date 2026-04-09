import React, { useState } from 'react';
import { Plus, Trash2, Clock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from '../types';

interface NotesScreenProps {
  notes: Note[];
  onAddNote: (text: string) => void;
  onDeleteNote: (id: string) => void;
}

export default function NotesScreen({ notes, onAddNote, onDeleteNote }: NotesScreenProps) {
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold typewriter uppercase text-detective-paper">Diário de Bordo</h2>

      <div className="paper-texture p-4 rounded-sm shadow-lg border-l-4 border-detective-accent">
        <textarea 
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Anote pensamentos rápidos, teorias ou observações de campo..."
          rows={3}
          className="w-full bg-transparent typewriter text-sm outline-none resize-none mb-4"
        />
        <button 
          onClick={handleAdd}
          disabled={!newNote.trim()}
          className="w-full py-2 bg-detective-accent text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus size={14} />
          Registrar Nota
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {notes.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <FileText size={48} className="mx-auto mb-4" />
              <p className="typewriter">Nenhuma nota registrada hoje.</p>
            </div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="paper-texture p-4 rounded-sm shadow-md flex flex-col relative group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-[8px] font-bold uppercase opacity-40">
                    <Clock size={10} />
                    {new Date(note.timestamp).toLocaleString('pt-BR')}
                  </div>
                  <button 
                    onClick={() => onDeleteNote(note.id)}
                    className="text-red-500/20 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="typewriter text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-detective-accent/5 rounded-full blur-xl group-hover:bg-detective-accent/10 transition-all" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
