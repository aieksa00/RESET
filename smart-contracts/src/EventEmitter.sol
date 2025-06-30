// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./interfaces/IEventEmitter.sol";
import "./interfaces/IReset.sol";

contract EventEmitter is IEventEmitter{
    error OnlyIncidentCanCall();
    error OnlyResetCanCall();
    error OnlyResetOrIncidentCanCall();

    IReset public reset;

    enum OfferEventType {
        New,
        Accepted,
        Rejected
    }

    constructor(address _reset) {
        reset = IReset(_reset);
    }

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
    event MessageSent(address indexed incidentAddress, address indexed from, address indexed to, bytes encryptedMessage);
    event SignedContractEvent(address indexed incidentAddress, address indexed creator, address indexed hacker, bytes contractData);

    modifier onlyIncident() {
        if (!reset.isIncidentAddress(msg.sender)) {
            revert OnlyIncidentCanCall();
        }
        _;
    }

    modifier onlyReset() {
        if (msg.sender != address(reset)) {
            revert OnlyResetCanCall();
        }
        _;
    }

    modifier onlyResetOrIncident() {
        if (msg.sender != address(reset) && !reset.isIncidentAddress(msg.sender)) {
            revert OnlyResetOrIncidentCanCall();
        }
        _;
    }

    function emitIncidentRequested(uint256 _requestId, address _creator) external onlyReset {
        emit IncidentRequested(_requestId, _creator);
    }

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
    ) external onlyResetOrIncident {
        emit IncidentEvent(
            _requestId,
            _incidentAddress,
            _protocolName,
            _hackedAmount,
            _exploitedAddress,
            _hackerAddress,
            _txHash,
            _initialOfferAmount,
            _initialOfferValidity,
            _creator,
            _status
        );
    }

function emitNewOffer(
        address _incident,
        uint256 _offerId,
        uint8 _proposer,
        uint256 _returnAmount,
        uint256 _validUntil,
        string memory _protocolName
    ) external onlyResetOrIncident {
        emit OfferEvent(
            _incident,
            _offerId,
            _proposer,
            _returnAmount,
            _validUntil,
            _protocolName,
            uint8(OfferEventType.New)
        );
    }

    function emitOfferAccepted(
        address _incident,
        uint256 _offerId,
        uint8 _proposer,
        uint256 _returnAmount,
        uint256 _validUntil,
        string memory _protocolName
    ) external onlyIncident {
        emit OfferEvent(
            _incident,
            _offerId,
            _proposer,
            _returnAmount,
            _validUntil,
            _protocolName,
            uint8(OfferEventType.Accepted)
        );
    }

    function emitOfferRejected(
        address _incident,
        uint256 _offerId,
        uint8 _proposer,
        uint256 _returnAmount,
        uint256 _validUntil,
        string memory _protocolName
    ) external onlyIncident {
        emit OfferEvent(
            _incident,
            _offerId,
            _proposer,
            _returnAmount,
            _validUntil,
            _protocolName,
            uint8(OfferEventType.Rejected)
        );
    }

    function emitMailboxPublicKeyRegistered(address _user, bytes memory _publicKey) external {
        emit MailboxPublicKeyRegistered(_user, _publicKey);
    }

    function emitMessageSent(address _incidentAddress, address _from, address _to, bytes memory _encryptedMessage) external {
        emit MessageSent(_incidentAddress, _from, _to, _encryptedMessage);
    }

    function emitSignedContractEvent(address _incidentAddress, address _creator, address _hacker, bytes memory _contractData) external {
        emit SignedContractEvent(_incidentAddress, _creator, _hacker, _contractData);
    }
}