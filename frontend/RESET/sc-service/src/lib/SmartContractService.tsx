import styles from './SmartContractService.module.css';

import { ethers, isError } from 'ethers';
import resetAbi from './common/resetABI.json';
import mailboxABI from './common/mailboxABI.json';
import incidentAbi from './common/incidentABI.json';
import wethAbi from './common/wethABI.json';
import Swal from 'sweetalert2';

import { CreateOfferFormData, MailboxContractAddress, RequestHackDto, ResetContractAddress, WethContractAddress } from 'models';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function RequestHack(requestHack: RequestHackDto): Promise<boolean> {
  // Check if MetaMask is installed and connected
  const isMetaMaskConnected = await CheckMetaMask();
  if (!isMetaMaskConnected) {
    return false;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const resetContract = new ethers.Contract(ResetContractAddress.sepoliaAddress, resetAbi, signer);

  const timeTicks: number = new Date(requestHack.initialOfferValidity).getTime() / 1000;

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

    Swal.close();

    await Swal.fire({
      icon: 'success',
      title: 'Incident Requested',
      html: `Your incident request has been successfully submitted.<br>
            <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">Click here to open transation in explorer...</a>`,
      customClass: {
        confirmButton: styles['swal-ok-button'],
      },
    });

    return true;
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
    return false;
  }
}

export async function NewOffer(incidentAddress: string, newOffer: CreateOfferFormData): Promise<boolean> {
  // Check if MetaMask is installed and connected
  const isMetaMaskConnected = await CheckMetaMask();
  if (!isMetaMaskConnected) {
    return false;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const incidentContract = new ethers.Contract(incidentAddress, incidentAbi, signer);

  const timeTicks: number = new Date(newOffer.validUntil).getTime() / 1000;

  try {
    const tx = await incidentContract.newOffer(ethers.parseEther(newOffer.amount.toString()), timeTicks);

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

    Swal.close();

    await Swal.fire({
      icon: 'success',
      title: 'Offer Requested',
      html: `Your offer request has been successfully submitted.<br>
            <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">Click here to open transation in explorer...</a>`,
      customClass: {
        confirmButton: styles['swal-ok-button'],
      },
    });

    return true;
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
    return false;
  }
}

export async function RejectOffer(incidentAddress: string, offerId: number): Promise<boolean> {
  // Check if MetaMask is installed and connected
  const isMetaMaskConnected = await CheckMetaMask();
  if (!isMetaMaskConnected) {
    return false;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const incidentContract = new ethers.Contract(incidentAddress, incidentAbi, signer);

  try {
    const tx = await incidentContract.rejectOffer(offerId);

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

    Swal.close();

    await Swal.fire({
      icon: 'success',
      title: 'Offer Rejected',
      html: `Successfully rejected the offer.<br>
            <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">Click here to open transation in explorer...</a>`,
      customClass: {
        confirmButton: styles['swal-ok-button'],
      },
    });

    return true;
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
    return false;
  }
}

export async function AcceptOffer(incidentAddress: string, offerId: number): Promise<boolean> {
  // Check if MetaMask is installed and connected
  const isMetaMaskConnected = await CheckMetaMask();
  if (!isMetaMaskConnected) {
    return false;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const incidentContract = new ethers.Contract(incidentAddress, incidentAbi, signer);

  try {
    const tx = await incidentContract.acceptOffer(offerId);

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

    Swal.close();

    await Swal.fire({
      icon: 'success',
      title: 'Offer Accepted',
      html: `Successfully accepted the offer.<br>
            <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">Click here to open transation in explorer...</a>`,
      customClass: {
        confirmButton: styles['swal-ok-button'],
      },
    });

    return true;
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
    return false;
  }
}

export async function ApproveHackerOffer(incidentAddress: string, offerAmountWei: bigint): Promise<boolean> {
  // Check if MetaMask is installed and connected
  const isMetaMaskConnected = await CheckMetaMask();
  if (!isMetaMaskConnected) {
    return false;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const wethContract = new ethers.Contract(WethContractAddress.sepoliaAddress, wethAbi, signer);

  try {
    const tx = await wethContract.approve(incidentAddress, offerAmountWei);

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

    return true;
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
    return false;
  }
}

export async function CheckMetaMask(): Promise<boolean> {
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
      text: `An error occurred while checking MetaMask accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return false;
  }
}

export async function signMessageWithMetamask(): Promise<string> {
  const isMetaMaskConnected = await CheckMetaMask();
    if (!isMetaMaskConnected) {
      return "";
    }
  
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const signature = await signer.signMessage("I want to chat");
    return signature;
}

export async function RegisterPublicKey(publicKey: Uint8Array<ArrayBuffer>): Promise<boolean> {
  // Check if MetaMask is installed and connected
  const isMetaMaskConnected = await CheckMetaMask();
  if (!isMetaMaskConnected) {
    return false;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const mailboxContract = new ethers.Contract(MailboxContractAddress.sepoliaAddress, mailboxABI, signer);

  try {
    const tx = await mailboxContract.registerPublicKey(publicKey);

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

    Swal.close();

    await Swal.fire({
      icon: 'success',
      title: 'Public Key Registred',
      html: `Successfully registred public key.<br>
            <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">Click here to open transation in explorer...</a>`,
      customClass: {
        confirmButton: styles['swal-ok-button'],
      },
    });

    return true;
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
    return false;
  }
}

export async function SendMessage(incidentAddress: string, to: string, encryptedMessage: Uint8Array): Promise<boolean> {
  // Check if MetaMask is installed and connected
  const isMetaMaskConnected = await CheckMetaMask();
  if (!isMetaMaskConnected) {
    return false;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const mailboxContract = new ethers.Contract(MailboxContractAddress.sepoliaAddress, mailboxABI, signer);

  try {
    const tx = await mailboxContract.sendMessage(incidentAddress, to, encryptedMessage);

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

    Swal.close();

    await Swal.fire({
      icon: 'success',
      title: 'Message sent',
      html: `Successfully sent the message.<br>
            <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">Click here to open transation in explorer...</a>`,
      customClass: {
        confirmButton: styles['swal-ok-button'],
      },
    });

    return true;
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
    return false;
  }
}