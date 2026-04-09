export interface Clue {
  id: string;
  title: string;
  description: string;
  image: string; // Base64 or Blob URL
  timestamp: number;
  type: 'manual' | 'qr';
}

export interface QRClue {
  code: string;
  message: string;
  unlocked: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'player' | 'ai';
  timestamp: number;
}

export type SuspectStatus = 'Em Observação' | 'Álibi Confirmado' | 'Principal Suspeito';

export interface Suspect {
  id: string;
  name: string;
  alias: string;
  status: SuspectStatus;
  photo: string;
  bio: string;
  observations: string;
  linkedClueIds: string[];
  timestamp: number;
}

export interface Note {
  id: string;
  text: string;
  timestamp: number;
}
