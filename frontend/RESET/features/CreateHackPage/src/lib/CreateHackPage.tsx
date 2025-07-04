import styles from './CreateHackPage.module.css';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';

import { RequestHackDto, RESETRoutes } from 'models';
import { EnsureResetPrivateKey, RequestHack } from 'SCService';

export function CreateHackPage() {
  const [isFormActive, setIsFormActive] = useState(false);

  const { address, isConnected } = useAccount(); 
  const navigation = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RequestHackDto>();

  useEffect(() => {
    if (isConnected) {
      setIsFormActive(true);
    } else {
      setIsFormActive(false);
    }
  }, [isConnected, address, setValue]);

  const onSubmit = async (data: RequestHackDto) => {
    await EnsureResetPrivateKey(address);
    const goToAllHacks = await RequestHack(data);

    if (goToAllHacks) {
      navigation(RESETRoutes.Hacks);
    }
  };

  return (
    <div className={styles['report-hack-page']}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles['hack-form']}>
        <h1 className={styles['form-title']}>Report Hack</h1>
        <fieldset disabled={!isFormActive}>
          <div className={styles['form-group']}>
            <label htmlFor="protocolName">Protocol Name</label>
            <input type="text" id="protocolName" {...register('protocolName', { required: 'Protocol Name is required.' })} />
            {errors.protocolName && <p className={styles['error-message']}>{errors.protocolName.message}</p>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="exploitedAddress">Exploited Address</label>
            <input type="text" id="exploitedAddress" {...register('exploitedAddress', { required: 'Protocol Address is required.' })} />
            {errors.exploitedAddress && <p className={styles['error-message']}>{errors.exploitedAddress.message}</p>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="hackerAddress">Hacker Address</label>
            <input type="text" id="hackerAddress" {...register('hackerAddress', { required: 'Hacker Address is required.' })} />
            {errors.hackerAddress && <p className={styles['error-message']}>{errors.hackerAddress.message}</p>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="transactionHash">Transaction Hash</label>
            <input type="text" id="transactionHash" {...register('transactionHash', { required: 'Protocol Address is required.' })} />
            {errors.transactionHash && <p className={styles['error-message']}>{errors.transactionHash.message}</p>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="hackedAmount">Hacked Amount (WETH)</label>
            <input type="number" step="any" id="hackedAmount" {...register('hackedAmount', { required: 'Hacked Amount is required.' })} />
            {errors.hackedAmount && <p className={styles['error-message']}>{errors.hackedAmount.message}</p>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="initialOfferAmount">Initial Return Amount (WETH)</label>
            <input type="number" step="any" id="initialOfferAmount" {...register('initialOfferAmount', { required: 'Return Amount is required.' })} />
            {errors.initialOfferAmount && <p className={styles['error-message']}>{errors.initialOfferAmount.message}</p>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="initialOfferValidity">Offer Valid Until</label>
            <input type="date" id="initialOfferValidity" {...register('initialOfferValidity', { required: 'Return Amount is required.' })} />
            {errors.initialOfferValidity && <p className={styles['error-message']}>{errors.initialOfferValidity.message}</p>}
          </div>
          <div className={styles['actions']}>
            <button type="submit" className={styles['submit-button']} disabled={!isFormActive}>
              Submit
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default CreateHackPage;
