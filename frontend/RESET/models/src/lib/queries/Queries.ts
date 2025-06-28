import { gql } from 'graphql-request';

export function OfferQuery(incident: string): string {
  return gql`
    {
      offerEvents(where: { incident: "${incident}" }) {
        id
        incident
        offerId
        proposer
        returnAmount
        validUntil
        protocolName
        eventType
      }
    }
  `;
}

export const HacksQuery = gql`
  {
    incidentApproveds {
      id
      requestId
      incidentAddress
      protocolName
      hackedAmount
      exploitedAddress
      hackerAddress
      txHash
      initialOfferAmount
      initialOfferValidity
      creator
    }
  }
`;
