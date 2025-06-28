import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  IncidentApproved,
  IncidentRequested,
  OfferEvent,
  OwnershipTransferStarted,
  OwnershipTransferred
} from "../generated/Reset/Reset"

export function createIncidentApprovedEvent(
  requestId: BigInt,
  incidentAddress: Address,
  protocolName: string,
  hackedAmount: BigInt,
  exploitedAddress: Address,
  hackerAddress: Address,
  txHash: Bytes,
  initialOfferAmount: BigInt,
  initialOfferValidity: BigInt,
  creator: Address
): IncidentApproved {
  let incidentApprovedEvent = changetype<IncidentApproved>(newMockEvent())

  incidentApprovedEvent.parameters = new Array()

  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "incidentAddress",
      ethereum.Value.fromAddress(incidentAddress)
    )
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "protocolName",
      ethereum.Value.fromString(protocolName)
    )
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "hackedAmount",
      ethereum.Value.fromUnsignedBigInt(hackedAmount)
    )
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "exploitedAddress",
      ethereum.Value.fromAddress(exploitedAddress)
    )
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "hackerAddress",
      ethereum.Value.fromAddress(hackerAddress)
    )
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam("txHash", ethereum.Value.fromFixedBytes(txHash))
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "initialOfferAmount",
      ethereum.Value.fromUnsignedBigInt(initialOfferAmount)
    )
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "initialOfferValidity",
      ethereum.Value.fromUnsignedBigInt(initialOfferValidity)
    )
  )
  incidentApprovedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )

  return incidentApprovedEvent
}

export function createIncidentRequestedEvent(
  requestId: BigInt,
  creator: Address
): IncidentRequested {
  let incidentRequestedEvent = changetype<IncidentRequested>(newMockEvent())

  incidentRequestedEvent.parameters = new Array()

  incidentRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )
  incidentRequestedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )

  return incidentRequestedEvent
}

export function createOfferEventEvent(
  incident: Address,
  offerId: BigInt,
  proposer: i32,
  returnAmount: BigInt,
  validUntil: BigInt,
  protocolName: string,
  eventType: i32
): OfferEvent {
  let offerEventEvent = changetype<OfferEvent>(newMockEvent())

  offerEventEvent.parameters = new Array()

  offerEventEvent.parameters.push(
    new ethereum.EventParam("incident", ethereum.Value.fromAddress(incident))
  )
  offerEventEvent.parameters.push(
    new ethereum.EventParam(
      "offerId",
      ethereum.Value.fromUnsignedBigInt(offerId)
    )
  )
  offerEventEvent.parameters.push(
    new ethereum.EventParam(
      "proposer",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(proposer))
    )
  )
  offerEventEvent.parameters.push(
    new ethereum.EventParam(
      "returnAmount",
      ethereum.Value.fromUnsignedBigInt(returnAmount)
    )
  )
  offerEventEvent.parameters.push(
    new ethereum.EventParam(
      "validUntil",
      ethereum.Value.fromUnsignedBigInt(validUntil)
    )
  )
  offerEventEvent.parameters.push(
    new ethereum.EventParam(
      "protocolName",
      ethereum.Value.fromString(protocolName)
    )
  )
  offerEventEvent.parameters.push(
    new ethereum.EventParam(
      "eventType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(eventType))
    )
  )

  return offerEventEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent =
    changetype<OwnershipTransferStarted>(newMockEvent())

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
