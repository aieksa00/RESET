import { useEffect, useState } from 'react';
import { formatEther, getAddress } from 'ethers';
import styles from './HackCard.module.css';
import { HackDto, MailboxContractAddress, RESETRoutes } from 'models';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../HacksService/HacksService';
import { useNavigate } from 'react-router-dom';
import { useChatWindows } from '@providers';
import { generateSharedSecret, generateECDHKeypairFromHash, signMessageWithMetamask, registerPublicKey, ensureResetPrivateKey } from "SCService";
import { GraphQueryAPIKey, GraphQueryUrl, RegistredPublicKeysQuery } from 'models';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';

export interface RegisteredPublicKeyDTO {
  user: string;
  publicKey: string;
}


export function HackCard({ hack }: { hack: HackDto }) {
  const [canSendMessage, setCanSendMessage] = useState<boolean>(false);

  const { address } = useAccount();
  const { openChat } = useChatWindows();

  const navigation = useNavigate();

  const normalizedAddress = address ? getAddress(address).toLowerCase() : '';
  const normalizedCreator = getAddress(hack.creator).toLowerCase();
  const normalizedHackerAddress = getAddress(hack.hackerAddress).toLowerCase();

  let otherPartyAddress: string | null = null;
  if (normalizedAddress === normalizedHackerAddress) {
    otherPartyAddress = normalizedCreator;
  } else if (normalizedAddress === normalizedCreator) {
    otherPartyAddress = normalizedHackerAddress;
  }

  const { data, status } = useQuery({
    queryKey: ['registredPublicKeys', otherPartyAddress], // Add specific query key
    async queryFn(): Promise<{ mailboxPublicKeyRegistereds: RegisteredPublicKeyDTO[] }> {
      return await request(GraphQueryUrl, RegistredPublicKeysQuery(otherPartyAddress!), {}, { Authorization: `Bearer ${GraphQueryAPIKey}` });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!otherPartyAddress,
    retry: 2,
    retryDelay: 1000,
  });

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

  const handleSendMessage = async () => {
    const resetPrivateKey = await ensureResetPrivateKey(address);
  if (!resetPrivateKey) return;


    // Convert hex string public key to Uint8Array
    function hexStringToUint8Array(hexString: string): Uint8Array {
      if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
      }
      if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
      }
      const bytes = new Uint8Array(hexString.length / 2);
      for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
      }
      return bytes;
    }

    //CITANJE PUBLICKEY IZ CONTRACTA
    let otherPublicKey = data?.mailboxPublicKeyRegistereds?.[0]?.publicKey;
    if (!otherPublicKey) {
      // handle error
      return;
    }
    let otherPublicKeyBytes = hexStringToUint8Array(otherPublicKey);

    // Add 0x04 prefix to make it a valid uncompressed public key for secp256k1
    const uncompressedPrefix = new Uint8Array([0x04]);
    const otherPublicKeyWithPrefix = new Uint8Array(65);
    otherPublicKeyWithPrefix.set(uncompressedPrefix, 0);
    otherPublicKeyWithPrefix.set(otherPublicKeyBytes, 1);

    //GENERISANJE SHARED SECRETA
    const sharedSecret = generateSharedSecret(
      hexStringToUint8Array(resetPrivateKey),
      otherPublicKeyWithPrefix
    );

    console.log('Shared Secret:', sharedSecret);

    // TODO: loadAllMessages(sharedSecret, hack.incidentAddress);  SA GRAFA

    openChat(hack.id, hack.protocolName, hack.hackerAddress, hack.creator, sharedSecret, hack.incidentAddress);
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
