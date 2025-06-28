import styles from './SmartContractService.module.css';

import { ethers, isError } from 'ethers';
import resetAbi from './common/resetABI.json';
import Swal from 'sweetalert2';

import { RequestHackDto, ResetContractAddress } from 'models';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function RequestHack(requestHack: RequestHackDto): Promise<any> {
  // Check if MetaMask is installed and connected
  const isMetaMaskConnected = await CheckMetaMask();
  if (!isMetaMaskConnected) {
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const resetContract = new ethers.Contract(
    ResetContractAddress.sepoliaAddress,
    resetAbi,
    signer
  );

  const timeTicks: number =
    new Date(requestHack.initialOfferValidity).getTime() / 1000;

  try {
    const tx = await resetContract.requestIncident(
      requestHack.protocolName,
      requestHack.exploitedAddress,
      ethers.parseEther(requestHack.hackedAmount.toString()),
      requestHack.hackerAddress,
      requestHack.transactionHash,
      ethers.parseEther(requestHack.initialOfferAmount.toString()),
      timeTicks
    );

    Swal.fire({
      title: 'Processing Transaction',
      text: 'Please wait while your transaction is being processed...',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    const receipt = await provider.waitForTransaction(tx.hash);
    console.log('Transaction receipt:', receipt);

    await Swal.fire({
      icon: 'success',
      title: 'Incident Requested',
      html: `Your incident request has been successfully submitted.<br>
            <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">Click here to open transation in explorer...</a>`,
      customClass: {
        confirmButton: styles['swal-ok-button'],
      },
    });
  } catch (error: any) {
    console.error('Transaction error:', error);
    if (isError(error, 'ACTION_REJECTED')) {
      await Swal.fire({
        icon: 'warning',
        title: 'Transaction Cancelled',
        text: 'You have cancelled the transaction.',
        customClass: {
          confirmButton: styles['swal-ok-button'],
        },
      });
      return;
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Transaction Error',
        text: 'An error occurred while processing the transaction.\nPlease try again later.',
        customClass: {
          confirmButton: styles['swal-ok-button'],
        },
      });
    }
  }
}

async function CheckMetaMask(): Promise<boolean> {
  if (!window.ethereum) {
    await Swal.fire({
      icon: 'error',
      title: 'MetaMask Not Installed',
      text: 'MetaMask is not installed. Please install MetaMask to proceed.',
      customClass: {
        confirmButton: styles['swal-ok-button'],
      },
    });
    return false;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Accounts Found',
        text: 'No accounts found. Please connect your MetaMask wallet.',
        customClass: {
        confirmButton: styles['swal-ok-button'],
      },
      });
      return false;
    }
    return true;
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error Checking MetaMask',
      text: `An error occurred while checking MetaMask accounts: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    });
    return false;
  }
}
