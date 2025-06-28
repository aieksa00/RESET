// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IReset {
    function requestIncident(
        string memory protocolName,
        address exploitedAddress,
        uint256 hackedAmount,
        address hackerAddress,
        bytes32 transactionHash,
        uint256 initialOfferAmount,
        uint256 initialOfferValidity
    ) external;

    function approveIncident(uint256 requestId) external;

    function getAllIncidents() external view returns (address[] memory);
}