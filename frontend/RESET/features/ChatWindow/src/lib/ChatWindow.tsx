import { useState, useRef, useEffect } from 'react';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 482, y: 32 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dialogRef.current && e.target === dialogRef.current.querySelector(`.${styles['chat-header']}`)) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
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

      setPosition({
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  return (
    <>
      <button className={styles['chat-trigger']} onClick={toggleChat} aria-label="Toggle chat">
        Chat
      </button>

      {isOpen && (
        <div
          ref={dialogRef}
          className={styles['dialog-content']}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'default',
          }}
          onMouseDown={handleMouseDown}
        >
          <div className={styles['chat-header']}>
            <h3>Chat</h3>
            <button className={styles['close-button']} onClick={toggleChat} aria-label="Close chat">
              ×
            </button>
          </div>
          <div className={styles['chat-content']}>{/* Chat content will go here */}</div>
        </div>
      )}
    </>
  );
}

export default ChatWindow;
