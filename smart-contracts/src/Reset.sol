// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./interfaces/IReset.sol";
import "./Incident.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IEventEmitter.sol";
import "./interfaces/IIncident.sol";

contract Reset is IReset, Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error IncidentDoesNotExist();
    error IncidentAlreadyApproved();
    error cantOfferMoreThanHackedAmount();
    error CantBeZero();
    error MailboxAlreadySet();
    error EventEmitterAlreadySet();

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
    address public mailbox;

    IEventEmitter public eventEmitter;

    address public feeCalculator;

    constructor(address _weth, address _feeCalculator) Ownable(_msgSender()) {
        weth = _weth;
        feeCalculator = _feeCalculator;
    }

    function setMailbox(address _mailbox) external onlyOwner {
        if (mailbox != address(0)) {
            revert MailboxAlreadySet();
        }

        if (_mailbox == address(0)) {
            revert CantBeZero();
        }

        mailbox = _mailbox;
    }

    function getMailbox() external view returns (address) {
        return mailbox;
    }

    function setEventEmitter(address _eventEmitter) external onlyOwner {
        if (address(eventEmitter) != address(0)) {
            revert EventEmitterAlreadySet();
        }

        if (_eventEmitter == address(0)) {
            revert CantBeZero();
        }
        
        eventEmitter = IEventEmitter(_eventEmitter);
    }

    function getEventEmitter() external view returns (address) {
        return address(eventEmitter);
    }

    function requestIncident(
        string memory _protocolName,
        address _exploitedAddress,
        uint256 _hackedAmount,
        address _hackerAddress,
        bytes32 _txHash,
        uint256 _initialOfferAmount,
        uint256 _initialOfferValidity
    ) external nonReentrant {
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

        eventEmitter.emitIncidentRequested(incidentRequestCount, _msgSender());

        incidentRequestCount++;
    }

    function approveIncident(uint256 _requestId) external onlyOwner nonReentrant {
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
            weth,
            _requestId,
            address(eventEmitter)
        );

        incidents.push(address(incident));
        isIncident[address(incident)] = true;

        bytes memory contractData = abi.encodePacked(
            "Protocol agrees not to take any legal action against the hacker if the incident is resolved and they found common ground."
        );
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = mailbox.call(
            abi.encodeWithSignature(
                "signContract(address,bytes)",
                address(incident),
                contractData
            )
        );
        require(success, "Mailbox signContract failed");

        uint8 status = IIncident(incident).getStatus();

        eventEmitter.emitIncidentEvent(
            _requestId,
            address(incident),
            incidentRequest.protocolName,
            incidentRequest.hackedAmount,
            incidentRequest.exploitedAddress,
            incidentRequest.hackerAddress,
            incidentRequest.txHash,
            incidentRequest.initialOfferAmount,
            incidentRequest.initialOfferValidity,
            incidentRequest.creator,
            status
        );

        eventEmitter.emitNewOffer(
            address(incident),
            0,
            1, // Proposer.Protocol
            incidentRequest.initialOfferAmount,
            incidentRequest.initialOfferValidity,
            incidentRequest.protocolName
        );
    }

    function getAllIncidents() external view returns (address[] memory) {
        return incidents;
    }

    function getIncident(uint256 _incidentId) external view returns (address) {
        if (_incidentId >= incidents.length) {
            revert IncidentDoesNotExist();
        }

        return incidents[_incidentId];
    }

     function withdraw(address _receiver) external onlyOwner nonReentrant {
         IERC20(weth).safeTransfer(_receiver, IERC20(weth).balanceOf(address(this)));
    }

    function isIncidentAddress(address _incidentAddress) external view returns (bool) {
        return isIncident[_incidentAddress];
    }

    receive() external payable {}

    fallback() external payable {}

    function renounceOwnership() public override onlyOwner {}
}