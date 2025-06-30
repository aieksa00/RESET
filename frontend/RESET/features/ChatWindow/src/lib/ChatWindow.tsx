import styles from './ChatWindow.module.css';
import { useState, useRef, useEffect } from 'react';
import { useChatWindows } from '@providers';

interface ChatWindowProps {
  id: string;
  title: string;
}

export function ChatWindow({ id, title }: ChatWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const { chatWindows, closeChat, updatePosition } = useChatWindows();
  const chatWindow = chatWindows.get(id);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dialogRef.current && e.target === dialogRef.current.querySelector(`.${styles['chat-header']}`)) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - chatWindow!.position.x,
        y: e.clientY - chatWindow!.position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep dialog within window bounds
      const maxX = window.innerWidth - (dialogRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (dialogRef.current?.offsetHeight || 0);

      updatePosition(id, {
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={dialogRef}
      className={styles['dialog-content']}
      style={{
        position: 'fixed',
        left: `${chatWindow!.position.x}px`,
        top: `${chatWindow!.position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={styles['chat-header']}>
        <h3>{title}</h3>
        <button className={styles['close-button']} onClick={() => closeChat(id)} aria-label="Close chat">
          ×
        </button>
      </div>
      <div className={styles['chat-content']}>
        
      </div>
    </div>
  );
}

export default ChatWindow;
