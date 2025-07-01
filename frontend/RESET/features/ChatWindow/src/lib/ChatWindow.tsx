import styles from './ChatWindow.module.css';
import { useState, useRef, useEffect } from 'react';
import { useChatWindows } from '@providers';
import { useForm } from 'react-hook-form';
import {
  encryptMessage,
  decryptMessage,
  combineIvAndCiphertext,
  splitIvAndCiphertext,
  SendMessage,
  MessageSentDTO,
  DecryptAllMessages,
} from 'SCService';
import { useAccount } from 'wagmi';
import { request } from 'graphql-request';
import { GraphQueryUrl, GraphQueryAPIKey, DecryptedMessageDto, MessageSentsQuery } from 'models';
import { useQuery } from '@tanstack/react-query';

interface ChatWindowProps {
  id: string;
  title: string;
  hackerAddress: string;
  creatorAddress: string;
  sharedSecret: Uint8Array<ArrayBufferLike>;
  incidentAddress: string;
}

export function ChatWindow(props: ChatWindowProps) {
  const [decryptedMessages, setDecryptedMessages] = useState<DecryptedMessageDto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const { chatWindows, closeChat, updatePosition } = useChatWindows();
  const chatWindow = chatWindows.get(props.id);

  const { address } = useAccount();

  const { data, status } = useQuery({
    queryKey: ['messageSents', props.incidentAddress],
    async queryFn(): Promise<{ messageSents: MessageSentDTO[] }> {
      return await request(GraphQueryUrl, MessageSentsQuery(props.incidentAddress), {}, { Authorization: `Bearer ${GraphQueryAPIKey}` });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!props.incidentAddress,
    retry: 2,
    retryDelay: 1000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (data?.messageSents && props.sharedSecret) {
      setDecryptedMessages(DecryptAllMessages(data.messageSents, props.sharedSecret));
    }
  }, [data?.messageSents, props.sharedSecret]);

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

  const onSubmit = async (messageData: { message: string }) => {
    try {
      const { ciphertext, iv } = await encryptMessage(props.sharedSecret, messageData.message);
      const combined = combineIvAndCiphertext(iv, ciphertext);

      let isSuccessful = false;
      if (address?.toLowerCase() === props.hackerAddress.toLowerCase()) {
        isSuccessful = await SendMessage(props.incidentAddress, props.creatorAddress, combined);
      } else if (address?.toLowerCase() === props.creatorAddress.toLowerCase()) {
        isSuccessful = await SendMessage(props.incidentAddress, props.hackerAddress, combined);
      }

      if (isSuccessful) {
        const newMessage: DecryptedMessageDto = {
          from: address!,
          to: address!.toLowerCase() === props.hackerAddress.toLowerCase() ? props.creatorAddress : props.hackerAddress,
          decryptedMessage: messageData.message,
          timestamp: new Date().getTime() / 1000,
        };
        setDecryptedMessages((prev) => [...prev, newMessage]);
      }

      reset({ message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
        {decryptedMessages.map((message, index) => (
          <div
            key={index}
            className={`${styles['message']} ${
              message.from.toLowerCase() === address?.toLowerCase() ? styles['message-sent'] : styles['message-received']
            }`}
          >
            <div className={styles['message-content']}>{message.decryptedMessage}</div>
            <div className={styles['message-timestamp']}>{new Date(message.timestamp*1000).toLocaleString()}</div>
          </div>
        ))}
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
