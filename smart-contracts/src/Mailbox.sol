// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./interfaces/IReset.sol";
import "./interfaces/IIncident.sol";

interface IOwnable {
    function owner() external view returns (address);
}

contract Mailbox {
    error IncidentDoesNotExist();
    error NoPublicKeyForRecipient();
    error NotAuthorized();
    error InvalidPublicKeyLength();

    IReset public reset;

    mapping(address => bytes) public publicKeys;

    struct Message {
        address from;
        address to;
        bytes encryptedMessage;
        uint256 timestamp;
    }
    mapping(uint256 => Message[]) private incidentMessages; // incidentId => messages

    struct SignedContract {
        address protocolRepresentative; // creator of the incident (protocol representative)
        address hacker;
        bytes contractData;
        uint256 timestamp;
    }
    mapping(uint256 => SignedContract) private incidentSignedContracts; // incidentId => signed contract

    event PublicKeyRegistered(address indexed user, bytes publicKey);
    event MessageSent(uint256 indexed incidentId, address indexed from, address indexed to, bytes encryptedMessage);
    event SignedContractEvent(uint256 indexed incidentId, address indexed creator, address indexed hacker, bytes contractData);

    modifier onlyIncident(uint256 _incidentId) {
        address incidentAddr = reset.getIncident(_incidentId);
        if (incidentAddr == address(0)) {
            revert IncidentDoesNotExist();
        }
        if (msg.sender != incidentAddr) {
            revert NotAuthorized();
        }
        _;
    }

    constructor(address _reset) {
        reset = IReset(_reset);
    }

    function registerPublicKey(bytes calldata _publicKey) external {
        if (_publicKey.length != 64) {
            revert InvalidPublicKeyLength();
        }

        publicKeys[msg.sender] = _publicKey;
        emit PublicKeyRegistered(msg.sender, _publicKey);
    }

    function getIncidentParticipants(uint256 _incidentId) public view returns (address creator, address hacker) {
        address incidentAddr = reset.getIncident(_incidentId);

        if (incidentAddr == address(0)) {
            revert IncidentDoesNotExist();
        }

        creator = IOwnable(incidentAddr).owner();
        hacker = IIncident(incidentAddr).getHackerAddress();
    }

    function signContract(uint256 _incidentId, bytes calldata _contractData) external onlyIncident(_incidentId) {
        (address creator, address hacker) = getIncidentParticipants(_incidentId);

        incidentSignedContracts[_incidentId] = SignedContract({
            protocolRepresentative: creator,
            hacker: hacker,
            contractData: _contractData,
            timestamp: block.timestamp
        });
        
        emit SignedContractEvent(_incidentId, creator, hacker, _contractData);
    }

    function getSignedContract(uint256 _incidentId) external view returns (SignedContract memory) {
        return incidentSignedContracts[_incidentId];
    }

    function sendMessage(uint256 _incidentId, address _to, bytes calldata _encryptedMessage) external {
        (address creator, address hacker) = getIncidentParticipants(_incidentId);
        if (!((msg.sender == creator && _to == hacker) || (msg.sender == hacker && _to == creator))) {
            revert NotAuthorized();
        }

        if (publicKeys[_to].length != 64) {
            revert NoPublicKeyForRecipient();
        }

        incidentMessages[_incidentId].push(Message({
            from: msg.sender,
            to: _to,
            encryptedMessage: _encryptedMessage,
            timestamp: block.timestamp
        }));
        emit MessageSent(_incidentId, msg.sender, _to, _encryptedMessage);
    }


    function getMessages(uint256 _incidentId) external view returns (Message[] memory) {
        return incidentMessages[_incidentId];
    }

    function getPublicKey(address _user) external view returns (bytes memory) {
        return publicKeys[_user];
    }
    
    receive() external payable {}

    fallback() external payable {}
}