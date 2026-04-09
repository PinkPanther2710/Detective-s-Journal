import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Clue, Suspect } from '../types';

interface ChatScreenProps {
  clues: Clue[];
  suspects: Suspect[];
}

export default function ChatScreen({ clues, suspects }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('detective_chat_history');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history", e);
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('detective_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const initializeWelcomeMessage = () => {
    setMessages([
      {
        id: '1',
        text: "Olá, Investigador. Vi que você já encontrou algumas pistas. Em que posso te ajudar a conectar os pontos?",
        sender: 'ai',
        timestamp: Date.now(),
      }
    ]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMsg = userMessage.toLowerCase();
    let response = "";

    // Check if user is asking about specific suspects
    const mentionedSuspect = suspects.find(s => 
      lowerMsg.includes(s.name.toLowerCase()) || 
      lowerMsg.includes(s.alias.toLowerCase())
    );

    // Check if user is asking about specific clues
    const mentionedClue = clues.find(clue => 
      lowerMsg.includes(clue.title.toLowerCase()) || 
      clue.title.toLowerCase().split(' ').some(word => word.length > 3 && lowerMsg.includes(word))
    );

    if (mentionedSuspect) {
      const linkedClues = clues.filter(c => mentionedSuspect.linkedClueIds.includes(c.id));
      const clueList = linkedClues.length > 0 
        ? ` Ele está vinculado às pistas: ${linkedClues.map(c => `"${c.title}"`).join(', ')}.`
        : " Ainda não vinculamos nenhuma pista direta a ele.";
      
      response = `Analisando o dossiê de "${mentionedSuspect.name}" (vulgo ${mentionedSuspect.alias}). Status atual: ${mentionedSuspect.status}.${clueList} O que o comportamento dele te diz sobre o crime?`;
    } else if (mentionedClue) {
      const relatedSuspects = suspects.filter(s => s.linkedClueIds.includes(mentionedClue.id));
      const suspectList = relatedSuspects.length > 0
        ? ` Esta pista aponta para: ${relatedSuspects.map(s => s.name).join(', ')}.`
        : " Ainda não conseguimos ligar esta evidência a nenhum suspeito específico.";

      response = `Ah, a "${mentionedClue.title}". Você anotou: "${mentionedClue.description}".${suspectList} Acha que há algo mais escondido nesse detalhe?`;
    } else if (lowerMsg.includes('principal suspeito') || lowerMsg.includes('quem é o culpado')) {
      const mainSuspect = suspects.find(s => s.status === 'Principal Suspeito');
      if (mainSuspect) {
        response = `Nossas atenções estão voltadas para "${mainSuspect.name}". Com ${mainSuspect.linkedClueIds.length} pistas vinculadas, ele é nossa melhor aposta no momento. Mas cuidado, as aparências enganam.`;
      } else {
        response = "Ainda não temos um suspeito principal definido. Precisamos de mais evidências concretas para apontar o dedo.";
      }
    } else if (lowerMsg.includes('dica') || lowerMsg.includes('ajuda') || lowerMsg.includes('pista') || lowerMsg.includes('help')) {
      if (clues.length === 0) {
        response = "O rastro está frio. Você ainda não documentou nenhuma evidência. Use sua câmera para capturar qualquer coisa que pareça fora de lugar.";
      } else {
        const randomClue = clues[Math.floor(Math.random() * clues.length)];
        response = `Você coletou ${clues.length} evidências. Eu sugiro reexaminar a "${randomClue.title}". Você a descreveu como "${randomClue.description}", mas será que há uma conexão com o local que estamos deixando passar?`;
      }
    } else {
      const genericResponses = [
        "Conte-me mais sobre o ambiente onde você encontrou isso.",
        "Observação interessante. Isso se alinha com as outras pistas que temos?",
        "Continue cavando. Cada detalhe importa em um caso como este.",
        "Estou cruzando isso com nosso banco de dados. Enquanto isso, o que mais você vê?",
        "Foque nas evidências físicas. Você já escaneou todos os códigos QR disponíveis?"
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }

    const aiMsg: Message = {
      id: crypto.randomUUID(),
      text: response,
      sender: 'ai',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: inputText,
      sender: 'player',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    getAIResponse(inputText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Chat Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-2 ${msg.sender === 'player' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  msg.sender === 'player' 
                    ? 'bg-detective-accent border-detective-paper/20 text-white' 
                    : 'bg-detective-paper border-detective-ink/20 text-detective-ink'
                }`}>
                  {msg.sender === 'player' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`p-3 rounded-sm shadow-md typewriter text-sm leading-relaxed ${
                  msg.sender === 'player'
                    ? 'bg-detective-accent text-white rounded-tr-none'
                    : 'paper-texture text-detective-ink rounded-tl-none border-l-4 border-detective-accent'
                }`}>
                  {msg.text}
                  <div className={`text-[8px] mt-1 opacity-50 text-right`}>
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-2 items-center paper-texture p-2 px-4 rounded-sm border-l-4 border-detective-accent/30">
              <Loader2 size={14} className="animate-spin text-detective-accent" />
              <span className="text-[10px] font-bold typewriter uppercase tracking-widest opacity-60">O Investigador está analisando...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-detective-accent/20 bg-detective-dark/50">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte ao especialista..."
            className="flex-1 bg-detective-paper/10 border border-detective-accent/30 rounded-sm p-3 pr-12 text-detective-paper typewriter text-sm focus:outline-none focus:border-detective-accent transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 p-2 text-detective-accent hover:text-detective-paper disabled:opacity-30 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[8px] text-center mt-2 opacity-40 typewriter uppercase tracking-widest">
          Canal Criptografado • Seguro de Ponta a Ponta
        </p>
      </div>
    </div>
  );
}
