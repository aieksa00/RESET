// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Reset.sol";
import "../src/Mailbox.sol";

contract DeployResetAndMailbox is Script {
    function run() external {
        vm.startBroadcast();
        Reset reset = new Reset(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9, 150);
        console.log("Reset deployed at:", address(reset));

        Mailbox mailbox = new Mailbox(address(reset));
        console.log("Mailbox deployed at:", address(mailbox));

        reset.setMailbox(address(mailbox));
        console.log("Mailbox set in Reset contract");

        vm.stopBroadcast();
    }
}