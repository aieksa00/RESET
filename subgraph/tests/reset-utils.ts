import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  IncidentApproved,
  IncidentRequested,
  OwnershipTransferStarted,
  OwnershipTransferred
} from "../generated/Reset/Reset"

export function createIncidentApprovedEvent(
  requestId: BigInt,
  incidentAddress: Address,
  protocolName: string,
  hackedAmount: BigInt
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
