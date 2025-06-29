import { Bytes } from "@graphprotocol/graph-ts"
import {
  IncidentApproved as IncidentApprovedEvent,
  IncidentRequested as IncidentRequestedEvent,
  OfferEvent as OfferEventEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/Reset/Reset"
import {
  IncidentApproved,
  IncidentRequested,
  OfferEvent,
  OwnershipTransferStarted,
  OwnershipTransferred
} from "../generated/schema"

export function handleIncidentApproved(event: IncidentApprovedEvent): void {
  let entity = new IncidentApproved(
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

export function handleOfferEvent(event: OfferEventEvent): void {
  let id = event.params.incident.toHex() + "-" + event.params.offerId.toString();
  let entity = OfferEvent.load(Bytes.fromUTF8(id));
  if (entity == null) {
    entity = new OfferEvent(Bytes.fromUTF8(id));
    entity.incident = event.params.incident;
    entity.offerId = event.params.offerId;
  }
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

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
