import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  MessageSent,
  PublicKeyRegistered,
  SignedContractEvent
} from "../generated/Mailbox/Mailbox"

export function createMessageSentEvent(
  incidentId: BigInt,
  from: Address,
  to: Address,
  encryptedMessage: Bytes
): MessageSent {
  let messageSentEvent = changetype<MessageSent>(newMockEvent())

  messageSentEvent.parameters = new Array()

  messageSentEvent.parameters.push(
    new ethereum.EventParam(
      "incidentId",
      ethereum.Value.fromUnsignedBigInt(incidentId)
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

export function createPublicKeyRegisteredEvent(
  user: Address,
  publicKey: Bytes
): PublicKeyRegistered {
  let publicKeyRegisteredEvent = changetype<PublicKeyRegistered>(newMockEvent())

  publicKeyRegisteredEvent.parameters = new Array()

  publicKeyRegisteredEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  publicKeyRegisteredEvent.parameters.push(
    new ethereum.EventParam("publicKey", ethereum.Value.fromBytes(publicKey))
  )

  return publicKeyRegisteredEvent
}

export function createSignedContractEventEvent(
  incidentId: BigInt,
  creator: Address,
  hacker: Address,
  contractData: Bytes
): SignedContractEvent {
  let signedContractEventEvent = changetype<SignedContractEvent>(newMockEvent())

  signedContractEventEvent.parameters = new Array()

  signedContractEventEvent.parameters.push(
    new ethereum.EventParam(
      "incidentId",
      ethereum.Value.fromUnsignedBigInt(incidentId)
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
