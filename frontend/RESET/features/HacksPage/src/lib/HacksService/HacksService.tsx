import { ethers } from 'ethers';

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export const decodeProtocolName = (hexString: string): string => {
  try {
    return ethers.decodeBytes32String(hexString);
  } catch (error) {
    return 'Invalid Protocol Name';
  }
};
