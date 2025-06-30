// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Reset.sol";
import "../src/EventEmitter.sol";
import "../src/Mailbox.sol";
import "../src/Incident.sol";
import "../src/interfaces/IReset.sol";
import "../src/interfaces/IEventEmitter.sol";

contract ResetTest is Test {
    Reset public reset;
    EventEmitter public eventEmitter;
    Mailbox public mailbox;
    address public weth = address(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9);
    address public owner = address(this);
    address public hacker = address(0xBEEF);
    address public exploited = address(0xCAFE);

    function setUp() public {
        reset = new Reset(weth, 150);
        console.log("Reset deployed at:", address(reset));

        eventEmitter = new EventEmitter(address(reset));
        console.log("EventEmitter deployed at:", address(eventEmitter));

        mailbox = new Mailbox(address(reset), address(eventEmitter));
        console.log("Mailbox deployed at:", address(mailbox));

        reset.setMailbox(address(mailbox));
        console.log("Mailbox set in Reset contract");

        reset.setEventEmitter(address(eventEmitter));
        console.log("EventEmitter set in Reset contract");
    }

    function testRequestAndApproveIncident() public {
        string memory protocolName = "TestProtocol";
        uint256 hackedAmount = 1 ether;
        bytes32 txHash = keccak256("txhash");
        uint256 initialOfferAmount = 0.5 ether;
        uint256 initialOfferValidity = 1 days;

        reset.requestIncident(
            protocolName,
            exploited,
            hackedAmount,
            hacker,
            txHash,
            initialOfferAmount,
            initialOfferValidity
        );

        reset.approveIncident(0);

        address incidentAddr = reset.getIncident(0);
        assertTrue(reset.isIncidentAddress(incidentAddr));
    }
}