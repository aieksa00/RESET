import styles from './CreateOffer.module.css';

import { useForm } from 'react-hook-form';

import { CreateOfferFormData } from 'models';
import { ApproveHackerOffer, NewOffer } from 'SCService';
import { ethers, formatEther } from 'ethers';

interface CreateOfferProps {
  incidentAddress: string;
  canCreateOffer: boolean;
  isHacker: boolean;
  maxOfferAmount: bigint;
}

export function CreateOffer(props: CreateOfferProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOfferFormData>();

  const onSubmit = async (data: CreateOfferFormData) => {
    if (props.isHacker) {
      const isSuccesfull = await ApproveHackerOffer(props.incidentAddress, ethers.parseEther(data.amount.toString()));
      console.log('Approve Hacker Offer Result:', isSuccesfull);
      if (!isSuccesfull) {
        return;
      }
    }
    NewOffer(props.incidentAddress, data);
  };

  return (
    <div className={styles['offer-form']}>
      <h2>Create Offer</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles['form']}>
        <div className={styles['form-group']}>
          <label htmlFor="amount" className={styles['label']}>
            Amount (WETH):
          </label>
          <input
            type="number"
            step="any"
            id="amount"
            {...register('amount', {
              required: 'Amount is required',
              max: { value: Number(formatEther(props.maxOfferAmount)), message: `Maximum offer amount is ${formatEther(props.maxOfferAmount)} WETH` },
              pattern: {
                value: /^[0-9]*\.?[0-9]+$/,
                message: 'Invalid amount format',
              },
            })}
            disabled={!props.canCreateOffer}
          />
          {errors.amount && <p className={styles['error-message']}>{errors.amount.message}</p>}
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="validUntil" className={styles['label']}>
            Valid Until:
          </label>
          <input
            type="date"
            id="validUntil"
            {...register('validUntil', {
              required: 'Valid until date is required',
            })}
            disabled={!props.canCreateOffer}
          />
          {errors.validUntil && <p className={styles['error-message']}>{errors.validUntil.message}</p>}
        </div>
        <div className={styles['actions']}>
          <button type="submit" className={styles['submit-button']} disabled={!props.canCreateOffer}>
            Submit Offer
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateOffer;
