import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { IncidentApproved } from "../generated/schema"
import { IncidentApproved as IncidentApprovedEvent } from "../generated/Reset/Reset"
import { handleIncidentApproved } from "../src/reset"
import { createIncidentApprovedEvent } from "./reset-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let requestId = BigInt.fromI32(234)
    let incidentAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let protocolName = "Example string value"
    let hackedAmount = BigInt.fromI32(234)
    let hackerAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let transactionHash = Bytes.fromI32(1234567890)
    let initialOfferAmount = BigInt.fromI32(234)
    let initialOfferValidity = BigInt.fromI32(234)
    let creator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newIncidentApprovedEvent = createIncidentApprovedEvent(
      requestId,
      incidentAddress,
      protocolName,
      hackedAmount,
      hackerAddress,
      transactionHash,
      initialOfferAmount,
      initialOfferValidity,
      creator
    )
    handleIncidentApproved(newIncidentApprovedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("IncidentApproved created and stored", () => {
    assert.entityCount("IncidentApproved", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "requestId",
      "234"
    )
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "incidentAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "protocolName",
      "Example string value"
    )
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "hackedAmount",
      "234"
    )
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "hackerAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "transactionHash",
      "1234567890"
    )
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "initialOfferAmount",
      "234"
    )
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "initialOfferValidity",
      "234"
    )
    assert.fieldEquals(
      "IncidentApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "creator",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
