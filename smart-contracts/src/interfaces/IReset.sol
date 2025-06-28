// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IReset {
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

    function emitNewOffer(
        address _incident,
        uint256 _offerId,
        uint8 _proposer,
        uint256 _returnAmount,
        uint256 _validUntil
    ) external;

    function emitOfferAccepted(
        address _incident,
        string memory _protocolName,
        uint256 _returnedAmount
    ) external;

    function emitOfferRejected(
        address _incident,
        string memory _protocolName,
        uint256 _returnedAmount,
        uint8 _proposer
    ) external;

    function getFee() external view returns (uint256);

    function withdraw(address _receiver) external;
}