// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Reset.sol";

contract DeployReset is Script {
    function run() external {
        vm.startBroadcast();
        Reset reset = new Reset(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9);
        console.log("Reset deployed at:", address(reset));
        vm.stopBroadcast();
    }
}