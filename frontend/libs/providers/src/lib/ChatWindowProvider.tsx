import React, { createContext, useContext, useState } from 'react';

interface ChatWindow {
  id: string;
  isOpen: boolean;
  position: { x: number; y: number };
}

interface ChatWindowContextType {
  chatWindows: Map<string, ChatWindow>;
  openChat: (id: string) => void;
  closeChat: (id: string) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
}

const ChatWindowContext = createContext<ChatWindowContextType | undefined>(undefined);

export function ChatWindowProvider({ children }: { children: React.ReactNode }) {
  const [chatWindows, setChatWindows] = useState<Map<string, ChatWindow>>(new Map());

  const openChat = (id: string) => {
    setChatWindows((current) => {
      const newWindows = new Map(current);
      newWindows.set(id, {
        id,
        isOpen: true,
        position: { x: window.innerWidth - 482, y: 32 + chatWindows.size * 40 },
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
