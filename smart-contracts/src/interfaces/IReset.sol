// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IReset {
    function setMailbox(address _mailbox) external;

    function getMailbox() external view returns (address);

    function setEventEmitter(address _eventEmitter) external;

    function getEventEmitter() external view returns (address);

    function requestIncident(
        string memory _protocolName,
        address _exploitedAddress,
        uint256 _hackedAmount,
        address _hackerAddress,
        bytes32 _transactionHash,
        uint256 _initialOfferAmount,
        uint256 _initialOfferValidity
    ) external;

    function approveIncident(uint256 _requestId) external;

    function getAllIncidents() external view returns (address[] memory);

    function getIncident(uint256 _incidentId) external view returns (address);

    function withdraw(address _receiver) external;

    function isIncidentAddress(address _incidentAddress) external view returns (bool);

    function feeCalculator() external view returns (address);
}