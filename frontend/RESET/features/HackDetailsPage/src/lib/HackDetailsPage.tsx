import styles from './HackDetailsPage.module.css';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { formatEther, getAddress } from 'ethers';
import { request } from 'graphql-request';

import { GraphQueryAPIKey, GraphQueryUrl, HackDto, OfferDto, OfferQuery } from 'models';
import CreateOffer from './CreateOffer/CreateOffer';
import OfferCard from './OfferCard/OfferCard';

export function HackDetailsPage() {
  const [canCreateOffer, setCanCreateOffer] = useState<boolean>(false);
  const [isHacker, setIsHacker] = useState<boolean>(false);

  const location = useLocation();
  const hack = location.state?.hack as HackDto;

  const { address } = useAccount();

  const { data, status } = useQuery({
    queryKey: ['offers', hack.incidentAddress], // Add specific query key
    async queryFn(): Promise<{ offerEvents: OfferDto[] }> {
      return await request(GraphQueryUrl, OfferQuery(hack.incidentAddress), {}, { Authorization: `Bearer ${GraphQueryAPIKey}` });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!hack.incidentAddress,
    retry: 2,
    retryDelay: 1000,
  });

  const sortOffers = (offers: OfferDto[]) => {
    const customOrder = { 1: 0, 2: 1, 0: 2 }; // Priority: Accepted(1) -> Rejected(2) -> Active(0)
    
    return [...offers].sort((a, b) => 
      (customOrder[a.eventType as keyof typeof customOrder] || 0) - 
      (customOrder[b.eventType as keyof typeof customOrder] || 0)
    );
  };

  const sortedOffers = data?.offerEvents ? sortOffers(data.offerEvents) : [];

  useEffect(() => {
    const normalizedAddress = address ? getAddress(address).toLowerCase() : '';
    const normalizedCreator = getAddress(hack.creator).toLowerCase();
    const normalizedHackerAddress = getAddress(hack.hackerAddress).toLowerCase();

    setCanCreateOffer(normalizedAddress === normalizedCreator || normalizedAddress === normalizedHackerAddress);
    setIsHacker(normalizedAddress === normalizedHackerAddress);
  }, [hack.creator, hack.hackerAddress, address]);

  const renderOffersSection = () => {
    if (status === 'pending') {
      return (
        <div className={styles['loading-container']}>
          <div className={styles['spinner']}></div>
          <h3>Loading offers...</h3>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className={styles['error-container']}>
          <h3>Error loading offers...</h3>
        </div>
      );
    }

    if (!data.offerEvents.length && status === 'success') {
      return (
        <div className={styles['no-offers']}>
          <h3>No offers available</h3>
        </div>
      );
    }

    return (
      <>
        <h1 className={styles['offers-title']}>Offers</h1>
        <div className={styles['offers-section']}>
          {sortedOffers.map((offer, index) => (
            <OfferCard key={index} offer={offer} hackerAddress={hack.hackerAddress} hackStatus={hack.status} creatorAddress={hack.creator} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={styles['hack-details-page']}>
      <div className={styles['header']}>
        <div className={styles['hack-card']}>
          <h2>Hack Details</h2>
          <div className={styles['hack-item']}>
            <span className={styles['label']}>Protocol Name:</span>
            <span className={styles['value']}>{hack.protocolName}</span>
          </div>
          <div className={styles['hack-item']}>
            <span className={styles['label']}>Hacked Address:</span>
            <span className={styles['value']}>{hack.exploitedAddress}</span>
          </div>
          <div className={styles['hack-item']}>
            <span className={styles['label']}>Hacked Amount:</span>
            <span className={styles['value']}>{formatEther(hack.hackedAmount)} WETH</span>
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
        <CreateOffer incidentAddress={hack.incidentAddress} canCreateOffer={canCreateOffer} isHacker={isHacker} maxOfferAmount={hack.hackedAmount} />
      </div>
      {renderOffersSection()}
    </div>
  );
}

export default HackDetailsPage;
