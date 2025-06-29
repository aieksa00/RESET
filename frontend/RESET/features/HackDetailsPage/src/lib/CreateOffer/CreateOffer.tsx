import styles from './CreateOffer.module.css';

import { useForm } from 'react-hook-form';

import { CreateOfferFormData } from 'models';
import { NewOffer } from 'SCService';
import { formatEther } from 'ethers';

export function CreateOffer({
  incidentAddress,
  canCreateOffer,
  maxOfferAmount,
}: {
  incidentAddress: string;
  canCreateOffer: boolean;
  maxOfferAmount: bigint;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOfferFormData>();

  const onSubmit = (data: CreateOfferFormData) => {
    NewOffer(incidentAddress, data);
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
              max: { value: Number(formatEther(maxOfferAmount)), message: `Maximum offer amount is ${formatEther(maxOfferAmount)} ETH` },
              pattern: {
                value: /^[0-9]*\.?[0-9]+$/,
                message: 'Invalid amount format',
              },
            })}
            disabled={!canCreateOffer}
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
            disabled={!canCreateOffer}
          />
          {errors.validUntil && <p className={styles['error-message']}>{errors.validUntil.message}</p>}
        </div>

        <button type="submit" className={styles['submit-button']} disabled={!canCreateOffer}>
          Submit Offer
        </button>
      </form>
    </div>
  );
}

export default CreateOffer;
