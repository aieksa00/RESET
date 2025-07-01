import React, { createContext, useContext, useState } from 'react';

interface ChatWindow {
  id: string;
  protocolName: string;
  hackerAddress: string;
  creatorAddress: string;
  sharedSecret: Buffer;
  incidentAddress: string;
  isOpen: boolean;
  position: { x: number; y: number };
}

interface ChatWindowContextType {
  chatWindows: Map<string, ChatWindow>;
  openChat: (id: string, name: string, hackerAddress: string, creatorAddress: string, sharedSecret: Buffer, incidentAddress: string) => void;
  closeChat: (id: string) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
}

const ChatWindowContext = createContext<ChatWindowContextType | undefined>(undefined);

export function ChatWindowProvider({ children }: { children: React.ReactNode }) {
  const [chatWindows, setChatWindows] = useState<Map<string, ChatWindow>>(new Map());

  const openChat = (id: string, name: string, hackerAddress: string, creatorAddress: string, sharedSecret: Buffer, incidentAddress: string) => {
    setChatWindows((current) => {
      const newWindows = new Map(current);
      newWindows.set(id, {
        id,
        protocolName: name,
        hackerAddress: hackerAddress,
        creatorAddress: creatorAddress,
        sharedSecret: sharedSecret,
        incidentAddress: incidentAddress,
        isOpen: true,
        position: { x: window.innerWidth - 482, y: 32 },
      });
      return newWindows;
    });
  };

  const closeChat = (id: string) => {
    setChatWindows((current) => {
      const newWindows = new Map(current);
      newWindows.delete(id);
      return newWindows;
    });
  };

  const updatePosition = (id: string, position: { x: number; y: number }) => {
    setChatWindows((current) => {
      const newWindows = new Map(current);
      const window = newWindows.get(id);
      if (window) {
        newWindows.set(id, { ...window, position });
      }
      return newWindows;
    });
  };

  return <ChatWindowContext.Provider value={{ chatWindows, openChat, closeChat, updatePosition }}>{children}</ChatWindowContext.Provider>;
}

export const useChatWindows = () => {
  const context = useContext(ChatWindowContext);
  if (context === undefined) {
    throw new Error('useChatWindows must be used within a ChatProvider');
  }
  return context;
};
