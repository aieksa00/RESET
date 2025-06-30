import { useEffect, useState } from 'react';
import { formatEther, getAddress } from 'ethers';
import styles from './HackCard.module.css';
import { HackDto, RESETRoutes } from 'models';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../HacksService/HacksService';
import { useNavigate } from 'react-router-dom';
import { useChatWindows } from '@providers';

export function HackCard({ hack }: { hack: HackDto }) {
  const [canSendMessage, setCanSendMessage] = useState<boolean>(false);

  const { address } = useAccount();
  const { openChat } = useChatWindows();

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
    // TODO: Implement the logic before opening
    // generate shared secret and store it in local storage if not exists
    const sharedSecret: Buffer;
    openChat(hack.id, hack.protocolName, hack.hackerAddress, hack.creator, sharedSecret);
  };

  return (
    <div className={styles['hack-card']}>
      <div className={styles['hack-card-header']}>
        <div className={styles['hack-item']}>
          <span className={styles['label']}>Protocol Name:</span>
          <span className={styles['value']}>{hack.protocolName}</span>
        </div>
        <div className={`${styles['status-label']} ${hack.status === 0 ? styles['active'] : styles['resolved']}`}>
          {hack.status === 0 ? 'Active' : 'Resolved'}
        </div>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Hacked Address:</span>
        <span className={styles['value']}>{shortenAddress(hack.exploitedAddress)}</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Hacked Amount:</span>
        <span className={styles['value']}>{formatEther(hack.hackedAmount)} WETH</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Transaction hash:</span>
        <span className={styles['value']}>
          <a href={`https://sepolia.etherscan.io/tx/${hack.txHash}`} target="_blank" rel="noopener noreferrer">
            {shortenAddress(hack.txHash)}
          </a>
        </span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Hacker Address:</span>
        <span className={styles['value']}>{shortenAddress(hack.hackerAddress)}</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Initial Return Amount:</span>
        <span className={styles['value']}>{formatEther(hack.initialOfferAmount)} WETH</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Initial Offer Validty:</span>
        <span className={styles['value']}>{new Date(hack.initialOfferValidity * 1000).toUTCString()}</span>
      </div>
      <div className={styles['hack-item']}>
        <span className={styles['label']}>Protocol Representative:</span>
        <span className={styles['value']}>{shortenAddress(hack.creator)}</span>
      </div>
      <div className={styles['actions']}>
        <button className={styles['accept-button']} onClick={handleOfferDetails}>
          Offer details
        </button>
        <button className={styles['send-msg-button']} onClick={handleSendMessage} disabled={!canSendMessage}>
          Send message
        </button>
      </div>
    </div>
  );
}

export default HackCard;
