// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./interfaces/IReset.sol";
import "./Incident.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Reset is IReset, Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error IncidentDoesNotExist();
    error IncidentAlreadyApproved();
    error OnlyIncidentCanCall();
    error cantOfferMoreThanHackedAmount();

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

    uint256 public fee; // in bps

    enum OfferEventType { New, Accepted, Rejected }

    event IncidentRequested(uint256 indexed requestId, address indexed creator);
    event IncidentApproved(uint256 indexed requestId, address indexed incidentAddress, string protocolName, uint256 hackedAmount, address exploitedAddress, address hackerAddress, bytes32 txHash, uint256 initialOfferAmount, uint256 initialOfferValidity, address creator);

    event OfferEvent(
        address indexed incident,
        uint256 indexed offerId,
        uint8 indexed proposer,
        uint256 returnAmount,
        uint256 validUntil,
        string protocolName,
        OfferEventType eventType
    );

    modifier onlyIncident() {
        if (!isIncident[_msgSender()]) {
            revert OnlyIncidentCanCall();
        }
        _;
    }

    modifier onlyIncidentOrOwner() {
        if (tx.origin != owner() && !isIncident[_msgSender()]) {
            revert OnlyIncidentCanCall();
        }
        _;
    }

    constructor(address _weth, uint256 _fee) Ownable(_msgSender()) {
        weth = _weth;
        fee = _fee;
    }

    function requestIncident(
        string memory _protocolName,
        address _exploitedAddress,
        uint256 _hackedAmount,
        address _hackerAddress,
        bytes32 _txHash,
        uint256 _initialOfferAmount,
        uint256 _initialOfferValidity
    ) external {
        if (_initialOfferAmount > _hackedAmount) {
            revert cantOfferMoreThanHackedAmount();
        }

        incidentRequests[incidentRequestCount] = IncidentRequest({
            protocolName: _protocolName,
            exploitedAddress: _exploitedAddress,
            hackedAmount: _hackedAmount,
            hackerAddress: _hackerAddress,
            txHash: _txHash,
            initialOfferAmount: _initialOfferAmount,
            initialOfferValidity: _initialOfferValidity,
            creator: _msgSender(),
            approved: false
        });

        emit IncidentRequested(incidentRequestCount, _msgSender());

        incidentRequestCount++;
    }

    function approveIncident(uint256 _requestId) external onlyOwner {
        if (_requestId >= incidentRequestCount) {
            revert IncidentDoesNotExist();
        }

        IncidentRequest storage incidentRequest = incidentRequests[_requestId];

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

        emit IncidentApproved(_requestId, address(incident), incidentRequest.protocolName, incidentRequest.hackedAmount, incidentRequest.exploitedAddress, incidentRequest.hackerAddress, incidentRequest.txHash, incidentRequest.initialOfferAmount, incidentRequest.initialOfferValidity, incidentRequest.creator);
    }

    function getAllIncidents() external view returns (address[] memory) {
        return incidents;
    }

    function emitNewOffer(
        address _incident,
        uint256 _offerId,
        uint8 _proposer,
        uint256 _returnAmount,
        uint256 _validUntil,
        string memory _protocolName
    ) external onlyIncidentOrOwner {
        emit OfferEvent(
            _incident,
            _offerId,
            _proposer,
            _returnAmount,
            _validUntil,
            _protocolName,
            OfferEventType.New
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
            OfferEventType.Accepted
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
            OfferEventType.Rejected
        );
    }

    function getFee() external view returns (uint256) {
        return fee;
    }

     function withdraw(address _receiver) external onlyOwner nonReentrant {
         IERC20(weth).safeTransfer(_receiver, IERC20(weth).balanceOf(address(this)));
    }

    receive() external payable {}

    fallback() external payable {}

}