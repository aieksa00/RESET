// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./interfaces/IReset.sol";
import "./interfaces/IIncident.sol";
import "./interfaces/IEventEmitter.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IOwnable {
    function owner() external view returns (address);
}

contract Mailbox is ReentrancyGuard{
    error IncidentDoesNotExist();
    error NoPublicKeyForRecipient();
    error NotAuthorized();
    error InvalidPublicKeyLength();

    IReset public reset;

    IEventEmitter public eventEmitter;

    mapping(address => bytes) public publicKeys;

    struct Message {
        address from;
        address to;
        bytes encryptedMessage;
        uint256 timestamp;
    }
    mapping(address => Message[]) private incidentMessages; // incidentAddress => messages

    struct SignedContract {
        address protocolRepresentative; // creator of the incident (protocol representative)
        address hacker;
        bytes contractData;
        uint256 timestamp;
    }
    mapping(address => SignedContract) private incidentSignedContracts; // incidentAddress => signed contract

    modifier onlyReset() {
        if (msg.sender != address(reset)) {
            revert NotAuthorized();
        }
        _;
    }

    constructor(address _reset, address _eventEmitter) {
        reset = IReset(_reset);
        eventEmitter = IEventEmitter(_eventEmitter);
    }

    function registerPublicKey(bytes calldata _publicKey) external nonReentrant {
        if (_publicKey.length != 64) {
            revert InvalidPublicKeyLength();
        }

        publicKeys[msg.sender] = _publicKey;

        eventEmitter.emitMailboxPublicKeyRegistered(msg.sender, _publicKey);
    }

    function getIncidentParticipants(address _incidentAddress) public view returns (address creator, address hacker) {
        bool isIncident = reset.isIncidentAddress(_incidentAddress);
        if (!isIncident) {
            revert IncidentDoesNotExist();
        }

        creator = IOwnable(_incidentAddress).owner();
        hacker = IIncident(_incidentAddress).getHackerAddress();
    }

    function signContract(address _incidentAddress, bytes calldata _contractData) external onlyReset nonReentrant {
        (address creator, address hacker) = getIncidentParticipants(_incidentAddress);

        incidentSignedContracts[_incidentAddress] = SignedContract({
            protocolRepresentative: creator,
            hacker: hacker,
            contractData: _contractData,
            timestamp: block.timestamp
        });
        
        eventEmitter.emitSignedContractEvent(_incidentAddress, creator, hacker, _contractData, block.timestamp);
    }

    function getSignedContract(address _incidentAddress) external view returns (SignedContract memory) {
        return incidentSignedContracts[_incidentAddress];
    }

    function sendMessage(address _incidentAddress, address _to, bytes calldata _encryptedMessage) external nonReentrant {
        (address creator, address hacker) = getIncidentParticipants(_incidentAddress);
        if (!((msg.sender == creator && _to == hacker) || (msg.sender == hacker && _to == creator))) {
            revert NotAuthorized();
        }

        if (publicKeys[_to].length != 64) {
            revert NoPublicKeyForRecipient();
        }

        incidentMessages[_incidentAddress].push(Message({
            from: msg.sender,
            to: _to,
            encryptedMessage: _encryptedMessage,
            timestamp: block.timestamp
        }));
        eventEmitter.emitMessageSent(_incidentAddress, msg.sender, _to, _encryptedMessage, block.timestamp);
    }


    function getMessages(address _incidentAddress) external view returns (Message[] memory) {
        return incidentMessages[_incidentAddress];
    }

    function getPublicKey(address _user) external view returns (bytes memory) {
        return publicKeys[_user];
    }
    
    receive() external payable {}

    fallback() external payable {}
}