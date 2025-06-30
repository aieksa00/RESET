import styles from './OfferCard.module.css';
import { OfferDto } from 'models';
import { formatEther, getAddress } from 'ethers';
import { AcceptOffer, ApproveHackerOffer, RejectOffer } from 'SCService';
import { useAccount } from 'wagmi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface OfferCardProps {
  offer: OfferDto;
  hackerAddress: string;
  hackStatus: number;
  creatorAddress: string;
}

export function OfferCard(offerProps: OfferCardProps) {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const canAcceptRejectOffer = () => {
    const normalizedAddress = address ? getAddress(address).toLowerCase() : '';

    if (offerProps.offer.proposer === 0 && normalizedAddress === offerProps.creatorAddress) {
      return true;
    }
    if (offerProps.offer.proposer === 1 && normalizedAddress === offerProps.hackerAddress) {
      return true;
    }
    return false;
  };

  const handleAcceptOffer = async () => {
    if (offerProps.offer.proposer === 1) {
      const failed = await ApproveHackerOffer(offerProps.offer.incident, offerProps.offer.returnAmount);
      if (failed) {
        return;
      }
    }
    AcceptOffer(offerProps.offer.incident, offerProps.offer.offerId);
  };

  const rejectMutation = useMutation({
    mutationFn: () => RejectOffer(offerProps.offer.incident, offerProps.offer.offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', offerProps.offer.incident] });
    },
  });

  const handleRejectOffer = async () => {
    try {
      await rejectMutation.mutateAsync();
    } catch (error) {
      console.error('Error rejecting offer:', error);
    }
  };

  const getStatusClass = (eventType: number): string => {
    switch (eventType) {
      case 0:
        return styles['active'];
      case 1:
        return styles['accepted'];
      case 2:
        return styles['rejected'];
      default:
        return styles['active'];
    }
  };
  
  const getStatusText = (eventType: number): string => {
    switch (eventType) {
      case 0:
        return 'Active';
      case 1:
        return 'Accepted';
      case 2:
        return 'Rejected';
      default:
        return 'Active';
    }
  };

  return (
    <div className={styles['offer-card']}>
      <div className={styles['offer-card-header']}>
        <h3 className={styles['offer-title']}>{offerProps.offer.proposer === 1 ? 'Protocol Offer' : 'Hacker Offer'}</h3>
        {(!(offerProps.hackStatus === 1 && offerProps.offer.eventType === 0) && <div className={`${styles['status-label']} ${getStatusClass(offerProps.offer.eventType)}`}>
          {getStatusText(offerProps.offer.eventType)}
        </div>)}
      </div>
      <div className={styles['offer-item']}>
        <span className={styles['label']}>Return Amount:</span>
        <span className={styles['value']}>{formatEther(offerProps.offer.returnAmount)} WETH</span>
      </div>
      <div className={styles['offer-item']}>
        <span className={styles['label']}>Valid Until:</span>
        <span className={styles['value']}>{new Date(offerProps.offer.validUntil * 1000).toUTCString()}</span>
      </div>
      {offerProps.offer.eventType === 0 && offerProps.hackStatus === 0 && (
        <div className={styles['actions']}>
          <button className={styles['accept-button']} onClick={handleAcceptOffer} disabled={!canAcceptRejectOffer()}>
            Accept offer
          </button>
          <button className={styles['reject-button']} onClick={handleRejectOffer} disabled={!canAcceptRejectOffer()}>
            {rejectMutation.isPending ? 'Processing...' : 'Reject offer'}
          </button>
        </div>
      )}
    </div>
  );
}

export default OfferCard;
