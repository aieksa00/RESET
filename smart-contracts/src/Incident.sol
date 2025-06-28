// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IReset.sol";

contract Incident is Ownable2Step, ReentrancyGuard {
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
        address _weth
    ) Ownable(_owner) {
        protocolName = _protocolName;
        exploitedAddress = _exploitedAddress;
        hackedAmount = _hackedAmount;
        hackerAddress = _hackerAddress;
        transactionHash = _transactionHash;
        status = Status.Active;
        weth = IERC20(_weth);
        reset = _msgSender();

        _newOffer(Proposer.Protocol, _initialOfferAmount, _initialOfferValidity);
    }

    function newOffer(uint256 _returnAmount, uint256 _validUntil) external onlyHackerOrOwner nonReentrant {
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

        if (_proposer == Proposer.Hacker) {
            weth.forceApprove(address(this), _returnAmount);
        }

        IReset(reset).emitNewOffer(
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

        IReset(reset).emitOfferAccepted(
            address(this),
            _offerId,
            uint8(offer.proposer),
            offer.returnAmount,
            offer.validUntil,
            protocolName
        );
    }

    function _acceptOfferHacker(Offer storage offer) internal onlyHacker {
        offer.offerStatus = OfferStatus.Accepted;
        status = Status.Resolved;

        (uint256 feeAmount, uint256 payoutAmount) = _calculateFeeAndPayout(offer.returnAmount);

        weth.safeTransfer(reset, feeAmount);
        weth.safeTransfer(owner(), payoutAmount);
    }

    function _acceptOfferProtocol(Offer storage offer) internal onlyOwner {
        offer.offerStatus = OfferStatus.Accepted;
        status = Status.Resolved;

        (uint256 feeAmount, uint256 payoutAmount) = _calculateFeeAndPayout(offer.returnAmount);

        weth.safeTransferFrom(hackerAddress, reset, feeAmount);
        weth.safeTransferFrom(hackerAddress, _msgSender(), payoutAmount);
    }

    function _calculateFeeAndPayout(uint256 amount) internal view returns (uint256 feeAmount, uint256 payoutAmount) {
        uint256 fee = IReset(reset).getFee();
        feeAmount = (amount * fee) / 10000;
        payoutAmount = amount - feeAmount;
    }

    function RejectOffer(uint256 _offerId) external onlyHackerOrOwner nonReentrant {
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

        IReset(reset).emitOfferRejected(
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

    receive() external payable {}

    fallback() external payable {}
}