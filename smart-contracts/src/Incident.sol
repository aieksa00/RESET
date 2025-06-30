// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./interfaces/IIncident.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IReset.sol";
import "./interfaces/IEventEmitter.sol";
import "./interfaces/IFeeCalculator.sol";

contract Incident is IIncident, Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error OnlyHackerOrOwner();
    error OnlyHacker();
    error OfferDoesNotExist();
    error IncidentNotActive();
    error OfferNotActive();
    error OnlyHackerCanAcceptProtocolOffer();
    error OnlyProtocolCanAcceptHackerOffer();
    error cantOfferMoreThanHackedAmount();

    enum Status {
        Active,
        Resolved
    }

    enum Proposer {
        Hacker,
        Protocol
    }

    enum OfferStatus {
        Pending,
        Accepted,
        Rejected
    }

    struct Offer {
        Proposer proposer;
        uint256 returnAmount;
        uint256 validUntil;
        OfferStatus offerStatus;
    }

    uint256 public incidentId;
    string public protocolName;
    address public exploitedAddress;
    uint256 public hackedAmount;
    address public hackerAddress;
    bytes32 public transactionHash;

    mapping(uint256 => Offer) public offers;
    uint256 public offersCount = 0;

    Status public status;

    IERC20 public weth;

    address public reset;

    IEventEmitter public eventEmitter;

    IFeeCalculator public feeCalculator;

    modifier onlyHackerOrOwner() {
        if (_msgSender() != hackerAddress && _msgSender() != owner()) {
            revert OnlyHackerOrOwner();
        }
        _;
    }

    modifier onlyHacker() {
        if (_msgSender() != hackerAddress) {
            revert OnlyHacker();
        }
        _;
    }

    constructor(
        string memory _protocolName,
        address _exploitedAddress,
        uint256 _hackedAmount,
        address _hackerAddress,
        bytes32 _transactionHash,
        uint256 _initialOfferAmount,
        uint256 _initialOfferValidity,
        address _owner,
        address _weth,
        uint256 _incidentId,
        address _eventEmitter
    ) Ownable(_owner) {
        protocolName = _protocolName;
        exploitedAddress = _exploitedAddress;
        hackedAmount = _hackedAmount;
        hackerAddress = _hackerAddress;
        transactionHash = _transactionHash;
        status = Status.Active;
        weth = IERC20(_weth);
        reset = _msgSender();
        incidentId = _incidentId;

        eventEmitter = IEventEmitter(_eventEmitter);

        feeCalculator = IFeeCalculator(IReset(reset).feeCalculator());
        
        offers[offersCount] = Offer({
            proposer: Proposer.Protocol,
            returnAmount: _initialOfferAmount,
            validUntil: _initialOfferValidity,
            offerStatus: OfferStatus.Pending
        });

        offersCount++;
    }

    function newOffer(uint256 _returnAmount, uint256 _validUntil) external onlyHackerOrOwner nonReentrant {
        if (status != Status.Active) {
            revert IncidentNotActive();
        }
        
        if (_returnAmount > hackedAmount) {
            revert cantOfferMoreThanHackedAmount();
        }

        Proposer proposer = _isHackerOrOwner();

        _newOffer(proposer, _returnAmount, _validUntil);
    }

    function _newOffer(Proposer _proposer, uint256 _returnAmount, uint256 _validUntil) internal {
        offers[offersCount] = Offer({
            proposer: _proposer,
            returnAmount: _returnAmount,
            validUntil: _validUntil,
            offerStatus: OfferStatus.Pending
        });

        eventEmitter.emitNewOffer(
            address(this),
            offersCount,
            uint8(_proposer),
            _returnAmount,
            _validUntil,
            protocolName
        );

        offersCount++;
    }

    function _isHackerOrOwner() internal view returns (Proposer) {
        if (_msgSender() == owner()) {
            return Proposer.Protocol;
        } else {
            return Proposer.Hacker;
        }
    }

    function acceptOffer(uint256 _offerId) external onlyHackerOrOwner nonReentrant {
        if (status != Status.Active) {
            revert IncidentNotActive();
        }

        if (_offerId >= offersCount) {
            revert OfferDoesNotExist();
        }

        Offer storage offer = offers[_offerId];

        if (offer.validUntil < block.timestamp) {
            revert OfferNotActive();
        }

        if (offer.proposer == Proposer.Protocol) {
            _acceptOfferHacker(offer);
        } else {
            _acceptOfferProtocol(offer);
        }

        Offer storage initialOffer = offers[0];

        eventEmitter.emitOfferAccepted(
            address(this),
            _offerId,
            uint8(offer.proposer),
            offer.returnAmount,
            offer.validUntil,
            protocolName
        );

        eventEmitter.emitIncidentEvent(
            incidentId,
            address(this),
            protocolName,
            hackedAmount,
            exploitedAddress,
            hackerAddress,
            transactionHash,
            initialOffer.returnAmount,
            initialOffer.validUntil,
            owner(),
            uint8(status)
        );
    }

    function _acceptOfferHacker(Offer storage offer) internal onlyHacker {
        offer.offerStatus = OfferStatus.Accepted;
        status = Status.Resolved;

        (uint256 feeAmount, uint256 payoutAmount) = _calculateFeeAndPayout(offer.returnAmount);

        weth.safeTransferFrom(hackerAddress, reset, feeAmount);
        weth.safeTransferFrom(hackerAddress, owner(), payoutAmount);
    }

    function _acceptOfferProtocol(Offer storage offer) internal onlyOwner {
        offer.offerStatus = OfferStatus.Accepted;
        status = Status.Resolved;

        (uint256 feeAmount, uint256 payoutAmount) = _calculateFeeAndPayout(offer.returnAmount);

        weth.safeTransferFrom(hackerAddress, reset, feeAmount);
        weth.safeTransferFrom(hackerAddress, _msgSender(), payoutAmount);
    }

    function _calculateFeeAndPayout(uint256 _amount) internal view returns (uint256 feeAmount, uint256 payoutAmount) {
        feeAmount = feeCalculator.calculateFee(_amount);
        payoutAmount = _amount - feeAmount;
    }

    function rejectOffer(uint256 _offerId) external onlyHackerOrOwner nonReentrant {
        if (status != Status.Active) {
            revert IncidentNotActive();
        }

        if (_offerId >= offersCount) {
            revert OfferDoesNotExist();
        }

        Offer storage offer = offers[_offerId];

        if (offer.validUntil < block.timestamp) {
            revert OfferNotActive();
        }

        if (offer.offerStatus != OfferStatus.Pending) {
            revert OfferNotActive();
        }

        if (offer.proposer == Proposer.Protocol) {
            _rejectOfferHacker(offer);
        } else {
            _rejectOfferProtocol(offer);
        }

        eventEmitter.emitOfferRejected(
            address(this),
            _offerId,
            uint8(offer.proposer),
            offer.returnAmount,
            offer.validUntil,
            protocolName
        );
    }

    function _rejectOfferHacker(Offer storage offer) internal onlyHacker {
        offer.offerStatus = OfferStatus.Rejected;
    }

    function _rejectOfferProtocol(Offer storage offer) internal onlyOwner {
        offer.offerStatus = OfferStatus.Rejected;
    }

    function getHackerAddress() external view returns (address) {
        return hackerAddress;
    }

    function getStatus() external view returns (uint8) {
        return uint8(status);
    }

    function getOffer(uint256 _offerId) external view returns (uint8, uint256, uint256, uint8) {
        if (_offerId >= offersCount) {
            revert OfferDoesNotExist();
        }

        Offer storage offer = offers[_offerId];
        return (uint8(offer.proposer), offer.returnAmount, offer.validUntil, uint8(offer.offerStatus));
    }

    receive() external payable {}

    fallback() external payable {}

    function renounceOwnership() public override onlyOwner {}
}