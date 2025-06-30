// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Reset.sol";
import "../src/Mailbox.sol";
import "../src/EventEmitter.sol";
import "../src/FeeCalculator.sol";

contract DeployResetAndMailbox is Script {
    function run() external {
        vm.startBroadcast();

        uint256[] memory usdTiers = new uint256[](3);
        usdTiers[0] = 100_000;
        usdTiers[1] = 1_000_000;
        usdTiers[2] = 10_000_000;

        uint256[] memory bpsTiers = new uint256[](4);
        bpsTiers[0] = 100;
        bpsTiers[1] = 50;
        bpsTiers[2] = 10;
        bpsTiers[3] = 5;

        FeeCalculator feeCalculator = new FeeCalculator(
            0x694AA1769357215DE4FAC081bf1f309aDC325306,
            86400,
            usdTiers,
            bpsTiers
        );
        console.log("FeeCalculator deployed at:", address(feeCalculator));

        Reset reset = new Reset(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9, address(feeCalculator));
        console.log("Reset deployed at:", address(reset));

        EventEmitter eventEmitter = new EventEmitter(address(reset));
        console.log("EventEmitter deployed at:", address(eventEmitter));

        Mailbox mailbox = new Mailbox(address(reset), address(eventEmitter));
        console.log("Mailbox deployed at:", address(mailbox));

        reset.setMailbox(address(mailbox));
        console.log("Mailbox set in Reset contract");

        reset.setEventEmitter(address(eventEmitter));
        console.log("EventEmitter set in Reset contract");

        vm.stopBroadcast();
    }
}