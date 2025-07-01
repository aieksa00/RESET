import { gql } from 'graphql-request';

export function OfferQuery(incident: string): string {
  return gql`
    {
      offerEvents(
        where: { incident: "${incident}" }
        orderBy: eventType
        orderDirection: asc
      ) {
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
    incidentEvents {
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
      status
    }
  }
`;

export function RegistredPublicKeysQuery(userAddress: string): string {
  return gql`
    {
      mailboxPublicKeyRegistereds (
        where: { user: "${userAddress}" }
      ) {
        user
        publicKey
      }
    }
  `;
}

export function MessageSentsQuery(incidentAddress: string): string {
  return gql`
    {
      messageSents(
        where: { incidentAddress: "${incidentAddress}" }
        orderBy: timestamp
        orderDirection: asc
      ) {
        id
        incidentAddress
        from
        to
        encryptedMessage
        timestamp
      }
    }
  `;
}