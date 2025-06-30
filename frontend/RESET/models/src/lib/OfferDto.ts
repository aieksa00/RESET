export interface OfferDto {
  id: string;
  incident: string;
  offerId: number;
  proposer: number;
  returnAmount: bigint;
  validUntil: number;
  protocolName: string;
  eventType: number;
}

export interface CreateOfferFormData {
  amount: number;
  validUntil: Date;
}
