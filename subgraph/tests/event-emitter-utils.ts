import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  IncidentEvent,
  IncidentRequested,
  MailboxPublicKeyRegistered,
  MessageSent,
  OfferEvent,
  SignedContractEvent
} from "../generated/EventEmitter/EventEmitter"

export function createIncidentEventEvent(
  requestId: BigInt,
  incidentAddress: Address,
  protocolName: string,
  hackedAmount: BigInt,
  exploitedAddress: Address,
  hackerAddress: Address,
  txHash: Bytes,
  initialOfferAmount: BigInt,
  initialOfferValidity: BigInt,
  creator: Address,
  status: i32
): IncidentEvent {
  let incidentEventEvent = changetype<IncidentEvent>(newMockEvent())

  incidentEventEvent.parameters = new Array()

  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "incidentAddress",
      ethereum.Value.fromAddress(incidentAddress)
    )
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "protocolName",
      ethereum.Value.fromString(protocolName)
    )
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "hackedAmount",
      ethereum.Value.fromUnsignedBigInt(hackedAmount)
    )
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "exploitedAddress",
      ethereum.Value.fromAddress(exploitedAddress)
    )
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "hackerAddress",
      ethereum.Value.fromAddress(hackerAddress)
    )
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam("txHash", ethereum.Value.fromFixedBytes(txHash))
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "initialOfferAmount",
      ethereum.Value.fromUnsignedBigInt(initialOfferAmount)
    )
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "initialOfferValidity",
      ethereum.Value.fromUnsignedBigInt(initialOfferValidity)
    )
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  incidentEventEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return incidentEventEvent
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

export function createMailboxPublicKeyRegisteredEvent(
  user: Address,
  publicKey: Bytes
): MailboxPublicKeyRegistered {
  let mailboxPublicKeyRegisteredEvent =
    changetype<MailboxPublicKeyRegistered>(newMockEvent())

  mailboxPublicKeyRegisteredEvent.parameters = new Array()

  mailboxPublicKeyRegisteredEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  mailboxPublicKeyRegisteredEvent.parameters.push(
    new ethereum.EventParam("publicKey", ethereum.Value.fromBytes(publicKey))
  )

  return mailboxPublicKeyRegisteredEvent
}

export function createMessageSentEvent(
  incidentAddress: Address,
  from: Address,
  to: Address,
  encryptedMessage: Bytes
): MessageSent {
  let messageSentEvent = changetype<MessageSent>(newMockEvent())

  messageSentEvent.parameters = new Array()

  messageSentEvent.parameters.push(
    new ethereum.EventParam(
      "incidentAddress",
      ethereum.Value.fromAddress(incidentAddress)
    )
  )
  messageSentEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  messageSentEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  messageSentEvent.parameters.push(
    new ethereum.EventParam(
      "encryptedMessage",
      ethereum.Value.fromBytes(encryptedMessage)
    )
  )

  return messageSentEvent
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

export function createSignedContractEventEvent(
  incidentAddress: Address,
  creator: Address,
  hacker: Address,
  contractData: Bytes
): SignedContractEvent {
  let signedContractEventEvent = changetype<SignedContractEvent>(newMockEvent())

  signedContractEventEvent.parameters = new Array()

  signedContractEventEvent.parameters.push(
    new ethereum.EventParam(
      "incidentAddress",
      ethereum.Value.fromAddress(incidentAddress)
    )
  )
  signedContractEventEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  signedContractEventEvent.parameters.push(
    new ethereum.EventParam("hacker", ethereum.Value.fromAddress(hacker))
  )
  signedContractEventEvent.parameters.push(
    new ethereum.EventParam(
      "contractData",
      ethereum.Value.fromBytes(contractData)
    )
  )

  return signedContractEventEvent
}
