import {
  MessageSent as MessageSentEvent,
  PublicKeyRegistered as PublicKeyRegisteredEvent,
  SignedContractEvent as SignedContractEventEvent,
} from "../generated/Mailbox/Mailbox"
import {
  MessageSent,
  PublicKeyRegistered,
  SignedContractEvent,
} from "../generated/schema"

export function handleMessageSent(event: MessageSentEvent): void {
  let entity = new MessageSent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.incidentId = event.params.incidentId
  entity.from = event.params.from
  entity.to = event.params.to
  entity.encryptedMessage = event.params.encryptedMessage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePublicKeyRegistered(
  event: PublicKeyRegisteredEvent,
): void {
  let entity = new PublicKeyRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.publicKey = event.params.publicKey

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSignedContractEvent(
  event: SignedContractEventEvent,
): void {
  let entity = new SignedContractEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.incidentId = event.params.incidentId
  entity.creator = event.params.creator
  entity.hacker = event.params.hacker
  entity.contractData = event.params.contractData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
