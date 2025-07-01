// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Reset.sol";
import "../src/EventEmitter.sol";
import "../src/Mailbox.sol";
import "../src/Incident.sol";
import "../src/FeeCalculator.sol";

contract ResetTest is Test {
    Reset public reset;
    EventEmitter public eventEmitter;
    Mailbox public mailbox;
    FeeCalculator public feeCalculator;
    address public weth = address(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9);
    address public owner = address(this);
    address public hacker = address(0xBEEF);
    address public exploited = address(0xCAFE);

    event IncidentRequested(uint256 indexed requestId, address indexed creator);
    event IncidentEvent(uint256 indexed requestId, address indexed incidentAddress, string protocolName, uint256 hackedAmount, address exploitedAddress, address hackerAddress, bytes32 txHash, uint256 initialOfferAmount, uint256 initialOfferValidity, address creator, uint8 status);
    event OfferEvent(
        address indexed incident,
        uint256 indexed offerId,
        uint8 indexed proposer,
        uint256 returnAmount,
        uint256 validUntil,
        string protocolName,
        uint8 eventType
    );
    event MailboxPublicKeyRegistered(address indexed user, bytes publicKey);
    event MessageSent(address indexed incidentAddress, address indexed from, address indexed to, bytes encryptedMessage, uint256 timestamp);
    event SignedContractEvent(address indexed incidentAddress, address indexed creator, address indexed hacker, bytes contractData, uint256 timestamp);

    function setUp() public {

        uint256[] memory usdTiers = new uint256[](3);
        usdTiers[0] = 100_000;
        usdTiers[1] = 1_000_000;
        usdTiers[2] = 10_000_000;

        uint256[] memory bpsTiers = new uint256[](4);
        bpsTiers[0] = 100;
        bpsTiers[1] = 50;
        bpsTiers[2] = 10;
        bpsTiers[3] = 5;

        feeCalculator = new FeeCalculator(
            0x694AA1769357215DE4FAC081bf1f309aDC325306,
            86400,
            usdTiers,
            bpsTiers
        );
        console.log("FeeCalculator deployed at:", address(feeCalculator));
        
        reset = new Reset(weth, address(feeCalculator));
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
        uint256 initialOfferValidity = block.timestamp + 1 days;

        bytes memory dummyPublicKey = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40";
        mailbox.registerPublicKey(dummyPublicKey);

        vm.expectEmit(true, true, false, false, address(eventEmitter));
        emit IncidentRequested(0, address(this));
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
        
    function testRejectOfferByHacker() public {
        string memory protocolName = "TestProtocol";
        uint256 hackedAmount = 1 ether;
        bytes32 txHash = keccak256("txhash");
        uint256 initialOfferAmount = 0.5 ether;
        uint256 initialOfferValidity = block.timestamp + 1 days;

        bytes memory dummyPublicKey = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40";
        mailbox.registerPublicKey(dummyPublicKey);

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

        vm.expectEmit(true, true, true, false, address(eventEmitter));
        emit OfferEvent(
            incidentAddr,
            0,
            1, // Proposer.Protocol
            initialOfferAmount,
            initialOfferValidity,
            protocolName,
            2 // OfferEventType.Rejected
        );
        vm.prank(hacker);
        IIncident(incidentAddr).rejectOffer(0);
    }

    function testAcceptOfferByHacker() public {
        string memory protocolName = "TestProtocol";
        uint256 hackedAmount = 1 ether;
        bytes32 txHash = keccak256("txhash");
        uint256 initialOfferAmount = 0.5 ether;
        uint256 initialOfferValidity = block.timestamp + 1 days;

        bytes memory dummyPublicKey = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40";
        mailbox.registerPublicKey(dummyPublicKey);

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
        deal(weth, hacker, initialOfferAmount);
        address incidentAddr = reset.getIncident(0);
        vm.prank(hacker);
        IERC20(weth).approve(incidentAddr, initialOfferAmount);

        vm.expectEmit(true, true, true, false, address(eventEmitter));
        emit OfferEvent(
            incidentAddr,
            0,
            1, // Proposer.Protocol
            initialOfferAmount,
            initialOfferValidity,
            protocolName,
            1 // OfferEventType.Accepted
        );
        vm.prank(hacker);
        IIncident(incidentAddr).acceptOffer(0);
    }

    function testHackerCreatesOfferAndOwnerAccepts() public {
        string memory protocolName = "TestProtocol";
        uint256 hackedAmount = 1 ether;
        bytes32 txHash = keccak256("txhash");
        uint256 initialOfferAmount = 0.5 ether;
        uint256 initialOfferValidity = block.timestamp + 1 days;

        bytes memory dummyPublicKey = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40";
        mailbox.registerPublicKey(dummyPublicKey);

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
        uint256 hackerOfferAmount = 0.3 ether;
        uint256 hackerOfferValidity = block.timestamp + 2 days;

        vm.prank(hacker);
        IERC20(weth).approve(incidentAddr, hackerOfferAmount);

        vm.expectEmit(true, true, true, false, address(eventEmitter));
        emit OfferEvent(
            incidentAddr,
            1,
            0, // Proposer.Hacker
            hackerOfferAmount,
            hackerOfferValidity,
            protocolName,
            0 // OfferEventType.New
        );
        vm.prank(hacker);
        IIncident(incidentAddr).newOffer(hackerOfferAmount, hackerOfferValidity);

        deal(weth, hacker, hackerOfferAmount);

        vm.expectEmit(true, true, true, false, address(eventEmitter));
        emit OfferEvent(
            incidentAddr,
            1,
            0, // Proposer.Hacker
            hackerOfferAmount,
            hackerOfferValidity,
            protocolName,
            1 // OfferEventType.Accepted
        );
        IIncident(incidentAddr).acceptOffer(1);
    }

    function testHackerCreatesOffer_ExpectEvent() public {
        string memory protocolName = "TestProtocol";
        uint256 hackedAmount = 1 ether;
        bytes32 txHash = keccak256("txhash");
        uint256 initialOfferAmount = 0.5 ether;
        uint256 initialOfferValidity = block.timestamp + 1 days;

        bytes memory dummyPublicKey = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40";
        mailbox.registerPublicKey(dummyPublicKey);

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

        uint256 hackerOfferAmount = 0.3 ether;
        uint256 hackerOfferValidity = block.timestamp + 2 days;

        vm.expectEmit(true, true, true, true, address(eventEmitter));
        emit OfferEvent(
            incidentAddr,
            1,
            uint8(0), // Proposer.Hacker
            hackerOfferAmount,
            hackerOfferValidity,
            protocolName,
            0 // OfferEventType.New
        );

        vm.prank(hacker);
        IIncident(incidentAddr).newOffer(hackerOfferAmount, hackerOfferValidity);
    }

    function testCannotRequestIncidentWithTooLargeOffer() public {
        string memory protocolName = "TestProtocol";
        uint256 hackedAmount = 1 ether;
        uint256 initialOfferAmount = 2 ether;
        uint256 initialOfferValidity = block.timestamp + 1 days;
        bytes32 txHash = keccak256("txhash");
        bytes memory dummyPublicKey = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40";
        mailbox.registerPublicKey(dummyPublicKey);

        vm.expectRevert(Reset.cantOfferMoreThanHackedAmount.selector);
        reset.requestIncident(protocolName, exploited, hackedAmount, hacker, txHash, initialOfferAmount, initialOfferValidity);
    }

    function testCannotRequestIncidentWithoutMailboxKey() public {
        string memory protocolName = "TestProtocol";
        uint256 hackedAmount = 1 ether;
        uint256 initialOfferAmount = 0.5 ether;
        uint256 initialOfferValidity = block.timestamp + 1 days;
        bytes32 txHash = keccak256("txhash");

        vm.expectRevert(Reset.MailboxPublicKeyNotRegistered.selector);
        reset.requestIncident(protocolName, exploited, hackedAmount, hacker, txHash, initialOfferAmount, initialOfferValidity);
    }

    function testCannotApproveAlreadyApprovedIncident() public {
        string memory protocolName = "TestProtocol";
        uint256 hackedAmount = 1 ether;
        uint256 initialOfferAmount = 0.5 ether;
        uint256 initialOfferValidity = block.timestamp + 1 days;
        bytes32 txHash = keccak256("txhash");
        bytes memory dummyPublicKey = hex"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40";
        mailbox.registerPublicKey(dummyPublicKey);

        reset.requestIncident(protocolName, exploited, hackedAmount, hacker, txHash, initialOfferAmount, initialOfferValidity);
        reset.approveIncident(0);

        vm.expectRevert(Reset.IncidentAlreadyApproved.selector);
        reset.approveIncident(0);
    }
}