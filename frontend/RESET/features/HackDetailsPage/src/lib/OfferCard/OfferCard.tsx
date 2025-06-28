import styles from './OfferCard.module.css';
import { OfferDto } from 'models';
import { formatEther } from 'ethers';

export function OfferCard({ offer }: { offer: OfferDto }) {

  const handleAcceptOffer = () => {
    console.log(`Accepting offer with ID: ${offer.id}`);
    // Logic to accept the offer
  };

  const handlerejectOffer = () => {
    console.log(`Rejecting offer with ID: ${offer.id}`);
    // Logic to reject the offer
  };

  return (
    <div className={styles['offer-card']}>
      <h3 className={styles['offer-title']}>{offer.proposer === 1 ? 'Protocol Offer' : 'Hacker Offer'}</h3>
      <div className={styles['offer-item']}>
        <span className={styles['label']}>Return Amount:</span>
        <span className={styles['value']}>{formatEther(offer.returnAmount)} ETH</span>
      </div>
      <div className={styles['offer-item']}>
        <span className={styles['label']}>Valid Until:</span>
        <span className={styles['value']}>{new Date(offer.validUntil * 1000).toUTCString()}</span>
      </div>
      <div className={styles['actions']}>
        <button className={styles['accept-button']} onClick={handleAcceptOffer}>
          Accept offer
        </button>
        <button className={styles['reject-button']} onClick={handlerejectOffer}>
          Reject offer
        </button>
      </div>
    </div>
  );
}

export default OfferCard;
