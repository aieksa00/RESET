import styles from './HackDetailsPage.module.css';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { formatEther, getAddress } from 'ethers';
import { request } from 'graphql-request';

import { GraphQueryAPIKey, GraphQueryUrl, HackDto, OfferDto, OfferQuery } from 'models';
import { decodeProtocolName } from 'HacksPage';
import CreateOffer from './CreateOffer/CreateOffer';
import OfferCard from './OfferCard/OfferCard';

export function HackDetailsPage() {
  const [offers, setOffers] = useState<OfferDto[]>([]);

  const location = useLocation();
  const hack = location.state?.hack as HackDto;

  const { address } = useAccount();
  const [canCreateOffer, setCanCreateOffer] = useState<boolean>(false);

  const { data, status } = useQuery({
    queryKey: ['data'],
    async queryFn(): Promise<{ offerEvents: OfferDto[] }> {
      return await request(GraphQueryUrl, OfferQuery(hack.incidentAddress), {}, { Authorization: `Bearer ${GraphQueryAPIKey}` });
    },
  });

  useEffect(() => {
    if (status === 'success' && data) {
      setOffers(data.offerEvents || []);
    }
  }, [data, status]);

  useEffect(() => {
    const normalizedAddress = address ? getAddress(address).toLowerCase() : '';
    const normalizedCreator = getAddress(hack.creator).toLowerCase();
    const normalizedHackerAddress = getAddress(hack.hackerAddress).toLowerCase();

    if (normalizedAddress === normalizedCreator || normalizedAddress === normalizedHackerAddress) {
      setCanCreateOffer(true);
    } else {
      setCanCreateOffer(false);
    }
  }, [hack.creator, hack.hackerAddress, address]);

  return (
    <div className={styles['hack-details-page']}>
      <div className={styles['header']}>
        <div className={styles['hack-card']}>
          <h2>Hack Details</h2>
          <div className={styles['hack-item']}>
            <span className={styles['label']}>Protocol Name:</span>
            <span className={styles['value']}>{decodeProtocolName(hack.protocolName)}</span>
          </div>
          <div className={styles['hack-item']}>
            <span className={styles['label']}>Hacked Address:</span>
            <span className={styles['value']}>{hack.exploitedAddress}</span>
          </div>
          <div className={styles['hack-item']}>
            <span className={styles['label']}>Hacked Amount:</span>
            <span className={styles['value']}>{formatEther(hack.hackedAmount)} ETH</span>
          </div>
          <div className={styles['hack-item']}>
            <span className={styles['label']}>Transaction hash:</span>
            <span className={styles['value']}>
              <a href={`https://sepolia.etherscan.io/tx/${hack.txHash}`} target="_blank" rel="noopener noreferrer">
                {hack.txHash}
              </a>
            </span>
          </div>
          <div className={styles['hack-item']}>
            <span className={styles['label']}>Hacker Address:</span>
            <span className={styles['value']}>{hack.hackerAddress}</span>
          </div>
        </div>
        <CreateOffer incidentAddress={hack.incidentAddress} canCreateOffer={canCreateOffer} maxOfferAmount={hack.hackedAmount} />
      </div>
      <div className={styles['offers-section']}>
        {offers.map((offer, index) => (
          <OfferCard key={index} offer={offer} />
        ))}
      </div>
    </div>
  );
}

export default HackDetailsPage;
