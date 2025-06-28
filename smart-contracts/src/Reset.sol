// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Incident.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract Reset is Ownable2Step {
    error IncidentDoesNotExist();
    error IncidentAlreadyApproved();
    error OnlyIncidentCanCall();

    struct IncidentRequest {
        string protocolName;
        address exploitedAddress;
        uint256 hackedAmount;
        address hackerAddress;
        bytes32 txHash;
        uint256 initialOfferAmount;
        uint256 initialOfferValidity;
        address creator;
        bool approved;
    }

    mapping(uint256 => IncidentRequest) public incidentRequests;
    uint256 public incidentRequestCount;
    address[] public incidents;
    mapping(address => bool) public isIncident;

    address public weth;

    event IncidentRequested(uint256 indexed requestId, address indexed creator);
    event IncidentApproved(uint256 indexed requestId, address indexed incidentAddress, string indexed protocolName, uint256 hackedAmount, address hackerAddress, bytes32 txHash, uint256 initialOfferAmount, uint256 initialOfferValidity, address creator);

    event NewOffer(address indexed incident, uint256 indexed offerId, uint8 indexed proposer, uint256 returnAmount, uint256 validUntil);
    event OfferAccepted(address indexed incident, string indexed protocolName, uint256 indexed returnedAmount);

    modifier onlyIncident() {
        if (!isIncident[msg.sender]) {
            revert OnlyIncidentCanCall();
        }
        _;
    }


    constructor(address _weth) Ownable(_msgSender()) {
        weth = _weth;
    }

    function requestIncident(
        string memory protocolName,
        address exploitedAddress,
        uint256 hackedAmount,
        address hackerAddress,
        bytes32 txHash,
        uint256 initialOfferAmount,
        uint256 initialOfferValidity
    ) external {
        incidentRequests[incidentRequestCount] = IncidentRequest({
            protocolName: protocolName,
            exploitedAddress: exploitedAddress,
            hackedAmount: hackedAmount,
            hackerAddress: hackerAddress,
            txHash: txHash,
            initialOfferAmount: initialOfferAmount,
            initialOfferValidity: initialOfferValidity,
            creator: msg.sender,
            approved: false
        });

        emit IncidentRequested(incidentRequestCount, msg.sender);

        incidentRequestCount++;
    }

    function approveIncident(uint256 requestId) external onlyOwner {
        if (requestId >= incidentRequestCount) {
            revert IncidentDoesNotExist();
        }

        IncidentRequest storage incidentRequest = incidentRequests[requestId];

        if (incidentRequest.approved) {
            revert IncidentAlreadyApproved();
        }

        incidentRequest.approved = true;

        Incident incident = new Incident(
            incidentRequest.protocolName,
            incidentRequest.exploitedAddress,
            incidentRequest.hackedAmount,
            incidentRequest.hackerAddress,
            incidentRequest.txHash,
            incidentRequest.initialOfferAmount,
            incidentRequest.initialOfferValidity,
            incidentRequest.creator,
            weth
        );

        incidents.push(address(incident));
        isIncident[address(incident)] = true;

        emit IncidentApproved(requestId, address(incident), incidentRequest.protocolName, incidentRequest.hackedAmount, incidentRequest.hackerAddress, incidentRequest.txHash, incidentRequest.initialOfferAmount, incidentRequest.initialOfferValidity, incidentRequest.creator);
    }

    function getAllIncidents() external view returns (address[] memory) {
        return incidents;
    }

    function emitNewOffer(
        address incident,
        uint256 offerId,
        uint8 proposer,
        uint256 returnAmount,
        uint256 validUntil
    ) external onlyIncident {
        emit NewOffer(incident, offerId, proposer, returnAmount, validUntil);
    }

    function emitOfferAccepted(
        address incident,
        string memory protocolName,
        uint256 returnedAmount
    ) external onlyIncident {
        emit OfferAccepted(incident, protocolName, returnedAmount);
    }

}