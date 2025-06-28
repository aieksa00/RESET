export interface HackDto {
  id: string; // Unique identifier for the hack
  requestId: string; // Request ID
  incidentAddress: string; // Address of the incident
  protocolName: string; // Name of the protocol
  hackedAmount: bigint; // Amount hacked (in wei)
  exploitedAddress: string; // Address exploited by the hacker
  hackerAddress: string; // Address of the hacker
  txHash: string; // Transaction hash
  initialOfferAmount: bigint; // Initial offer amount (in wei)
  initialOfferValidity: number; // Validity timestamp (UNIX time)
  creator: string; // Address of the creator
}

export interface RequestHackDto {
  protocolName: string;
  exploitedAddress: string;

  hackedAmount: number;
  hackerAddress: string;
  transactionHash: string;

  initialOfferAmount: string;
  initialOfferValidity: Date;
}
