import { useLocation } from 'react-router-dom';
import styles from './HackDetailsPage.module.css';
import { HackDto } from 'models';

export function HackDetailsPage() {
  const location = useLocation();
  const hack = location.state?.hack as HackDto;

  return (
    <div className={styles['container']}>
      <h1>Hack Details</h1>
      <div className={styles['details']}>
        <p><strong>Protocol Name:</strong> {hack.protocolName}</p>
        <p><strong>Incident Address:</strong> {hack.incidentAddress}</p>
        <p><strong>Hacked Amount:</strong> {hack.hackedAmount} wei</p>
        <p><strong>Hacker Address:</strong> {hack.hackerAddress}</p>
        <p><strong>Transaction Hash:</strong> {hack.txHash}</p>
        <p><strong>Initial Offer Amount:</strong> {hack.initialOfferAmount} wei</p>
        <p><strong>Initial Offer Validity:</strong> {new Date(hack.initialOfferValidity * 1000).toUTCString()}</p>
        <p><strong>Creator:</strong> {hack.creator}</p>
      </div>
    </div>
  );
}

export default HackDetailsPage;
