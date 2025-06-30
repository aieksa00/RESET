// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IEventEmitter {
    function emitIncidentRequested(uint256 _requestId, address _creator) external;

    function emitIncidentEvent(
        uint256 _requestId,
        address _incidentAddress,
        string memory _protocolName,
        uint256 _hackedAmount,
        address _exploitedAddress,
        address _hackerAddress,
        bytes32 _txHash,
        uint256 _initialOfferAmount,
        uint256 _initialOfferValidity,
        address _creator,
        uint8 _status
    ) external;

    function emitNewOffer(
        address _incident,
        uint256 _offerId,
        uint8 _proposer,
        uint256 _returnAmount,
        uint256 _validUntil,
        string memory _protocolName
    ) external;

    function emitOfferAccepted(
        address _incident,
        uint256 _offerId,
        uint8 _proposer,
        uint256 _returnAmount,
        uint256 _validUntil,
        string memory _protocolName
    ) external;

    function emitOfferRejected(
        address _incident,
        uint256 _offerId,
        uint8 _proposer,
        uint256 _returnAmount,
        uint256 _validUntil,
        string memory _protocolName
    ) external;

    function emitMailboxPublicKeyRegistered(address _user, bytes memory _publicKey) external;

    function emitMessageSent(address _incidentAddress, address _from, address _to, bytes memory _encryptedMessage, uint256 _timestamp) external;

    function emitSignedContractEvent(address _incidentAddress, address _creator, address _hacker, bytes memory _contractData, uint256 _timestamp) external;
}