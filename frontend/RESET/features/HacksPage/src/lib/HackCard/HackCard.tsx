import { useEffect, useState } from 'react';
import { formatEther, getAddress } from 'ethers';
import styles from './HackCard.module.css';
import { HackDto, RESETRoutes } from 'models';
import { useAccount } from 'wagmi';
import { shortenAddress, decodeProtocolName } from '../HacksService/HacksService';
import { useNavigate } from 'react-router-dom';

export function HackCard({ hack }: { hack: HackDto }) {
  const [canSendMessage, setCanSendMessage] = useState<boolean>(false);

  const { address } = useAccount(); // Get wallet address and connection status

  const navigation = useNavigate();

  useEffect(() => {
    const normalizedAddress = address ? getAddress(address).toLowerCase() : '';
    const normalizedCreator = getAddress(hack.creator).toLowerCase();
    const normalizedHackerAddress = getAddress(hack.hackerAddress).toLowerCase();

    if (normalizedAddress === normalizedCreator || normalizedAddress === normalizedHackerAddress) {
      setCanSendMessage(true); 
    } else {
      setCanSendMessage(false);
    }
  }, [address, hack.creator, hack.hackerAddress]);

  const handleOfferDetails = () => {
    console.log(`Incident address: ${hack.incidentAddress}`);
    navigation(RESETRoutes.HackDetails, {
      state: { hack },
    });
  };

  const handleSendMessage = () => {
    console.log('Sending message...');
  };

  return (
    <div className={styles['hack-card']}>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Protocol Name:</span>
        <span className={styles['value']}>{decodeProtocolName(hack.protocolName)}</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Hacked Address:</span>
        <span className={styles['value']}>{shortenAddress(hack.exploitedAddress)}</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Hacked Amount:</span>
        <span className={styles['value']}>{formatEther(hack.hackedAmount)} ETH</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Transaction hash:</span>
        <span className={styles['value']}>
        <a href={`https://sepolia.etherscan.io/tx/${hack.txHash}`} target="_blank" rel="noopener noreferrer">{shortenAddress(hack.txHash)}</a>
        </span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Hacker Address:</span>
        <span className={styles['value']}>{shortenAddress(hack.hackerAddress)}</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Initial Return Amount:</span>
        <span className={styles['value']}>{formatEther(hack.initialOfferAmount)} ETH</span>
      </div>     
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Initial Offer Validty:</span>
        <span className={styles['value']}>
          {new Date(hack.initialOfferValidity*1000).toUTCString()}
        </span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Protocol Representative:</span>
        <span className={styles['value']}>{shortenAddress(hack.creator)}</span>
      </div>
      <div className={styles['actions']}>
        <button className={styles['accept-button']} onClick={handleOfferDetails}>
          Offer details
        </button>
        <button
          className={styles['send-msg-button']}
          onClick={handleSendMessage}
          disabled={!canSendMessage}
        >
          Send message
        </button>
      </div>
    </div>
  );
}

export default HackCard;
