export interface OfferDto {
  id: string;
  incident: string;
  offerId: number;
  proposer: number;
  returnAmount: number;
  validUntil: number;
  protocolName: string;
  eventType: number;
}

export interface CreateOfferFormData {
  amount: string; // Amount in ETH
  validUntil: Date; // Valid until (date or timestamp)
}
