import styles from './ChatWindow.module.css';
import { useState, useRef, useEffect } from 'react';
import { useChatWindows } from '@providers';
import { useForm } from 'react-hook-form';

interface ChatWindowProps {
  id: string;
  title: string;
  hackerAddress: string;
  creatorAddress: string;
  sharedSecret: Buffer;
}

export function ChatWindow(props: ChatWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const { chatWindows, closeChat, updatePosition } = useChatWindows();
  const chatWindow = chatWindows.get(props.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = (messageData: { message: string }) => {
    console.log('Encrypt me:', props.sharedSecret);
    console.log('Message sent:', messageData.message);
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

      updatePosition(props.id, {
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
        <h3>{props.title}</h3>
        <button className={styles['close-button']} onClick={() => closeChat(props.id)} aria-label="Close chat">
          ×
        </button>
      </div>
      <div className={styles['chat-content']}>
        
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles['chat-form']}>
          <div className={`${styles['input-container']} ${errors.message ? styles['error-border'] : ''}`}>
            <input
              type="text"
              id="message"
              {...register('message', {
                required: 'Message can not be empty.',
              })}
              className={styles['message-input']}
            />
            {errors.message && <p className={styles['error-message']}>{errors.message.message}</p>}
          </div>
          <button type="submit" className={styles['send-button']}>
            Send
          </button>
        </form>
    </div>
  );
}

export default ChatWindow;
