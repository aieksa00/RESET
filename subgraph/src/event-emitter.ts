import {
  IncidentEvent as IncidentEventEvent,
  IncidentRequested as IncidentRequestedEvent,
  MailboxPublicKeyRegistered as MailboxPublicKeyRegisteredEvent,
  MessageSent as MessageSentEvent,
  OfferEvent as OfferEventEvent,
  SignedContractEvent as SignedContractEventEvent
} from "../generated/EventEmitter/EventEmitter"
import {
  IncidentEvent,
  IncidentRequested,
  MailboxPublicKeyRegistered,
  MessageSent,
  OfferEvent,
  SignedContractEvent
} from "../generated/schema"

export function handleIncidentEvent(event: IncidentEventEvent): void {
  let entity = new IncidentEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId
  entity.incidentAddress = event.params.incidentAddress
  entity.protocolName = event.params.protocolName
  entity.hackedAmount = event.params.hackedAmount
  entity.exploitedAddress = event.params.exploitedAddress
  entity.hackerAddress = event.params.hackerAddress
  entity.txHash = event.params.txHash
  entity.initialOfferAmount = event.params.initialOfferAmount
  entity.initialOfferValidity = event.params.initialOfferValidity
  entity.creator = event.params.creator
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleIncidentRequested(event: IncidentRequestedEvent): void {
  let entity = new IncidentRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId
  entity.creator = event.params.creator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMailboxPublicKeyRegistered(
  event: MailboxPublicKeyRegisteredEvent
): void {
  let entity = new MailboxPublicKeyRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.publicKey = event.params.publicKey

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMessageSent(event: MessageSentEvent): void {
  let entity = new MessageSent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.incidentAddress = event.params.incidentAddress
  entity.from = event.params.from
  entity.to = event.params.to
  entity.encryptedMessage = event.params.encryptedMessage
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOfferEvent(event: OfferEventEvent): void {
  let entity = new OfferEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.incident = event.params.incident
  entity.offerId = event.params.offerId
  entity.proposer = event.params.proposer
  entity.returnAmount = event.params.returnAmount
  entity.validUntil = event.params.validUntil
  entity.protocolName = event.params.protocolName
  entity.eventType = event.params.eventType

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSignedContractEvent(
  event: SignedContractEventEvent
): void {
  let entity = new SignedContractEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.incidentAddress = event.params.incidentAddress
  entity.creator = event.params.creator
  entity.hacker = event.params.hacker
  entity.contractData = event.params.contractData
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
