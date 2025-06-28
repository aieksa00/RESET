// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

interface IReset {
    function emitNewOffer(
        address incident,
        uint256 offerId,
        Incident.Proposer proposer,
        uint256 returnAmount,
        uint256 validUntil
    ) external;

    function emitOfferAccepted(
        address incident,
        string memory protocolName,
        uint256 returnedAmount
    ) external;
}

contract Incident is Ownable {
    using SafeERC20 for IERC20;

    error OnlyHackerOrOwner();
    error OnlyHacker();
    error OfferDoesNotExist();
    error IncidentNotActive();
    error OfferNotActive();
    error OnlyHackerCanAcceptProtocolOffer();
    error OnlyProtocolCanAcceptHackerOffer();

    enum Status {
        Active,
        Resolved
    }

    enum Proposer {
        Hacker,
        Protocol
    }

    struct Offer {
        Proposer proposer;
        uint256 returnAmount;
        uint256 validUntil;
        bool accepted;
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
        if (msg.sender != hackerAddress && msg.sender != owner()) {
            revert OnlyHackerOrOwner();
        }
        _;
    }

    modifier onlyHacker() {
        if (msg.sender != hackerAddress) {
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
        reset = msg.sender;

        _newOffer(Proposer.Protocol, _initialOfferAmount, _initialOfferValidity);
    }

    function newOffer(uint256 _returnAmount, uint256 _validUntil) external onlyHackerOrOwner {
        Proposer proposer = _isHackerOrOwner();

        _newOffer(proposer, _returnAmount, _validUntil);
    }

    function _newOffer(Proposer _proposer, uint256 _returnAmount, uint256 _validUntil) internal {
        offers[offersCount] = Offer({
            proposer: _proposer,
            returnAmount: _returnAmount,
            validUntil: _validUntil,
            accepted: false
        });

        if (_proposer == Proposer.Hacker) {
            weth.forceApprove(address(this), _returnAmount);
        }

        IReset(reset).emitNewOffer(
            address(this),
            offersCount,
            _proposer,
            _returnAmount,
            _validUntil
        );

        offersCount++;
    }

    function _isHackerOrOwner() internal view returns (Proposer) {
        if (msg.sender == owner()) {
            return Proposer.Protocol;
        } else {
            return Proposer.Hacker;
        }
    }

    function acceptOffer(uint256 offerId) external onlyHackerOrOwner {
        if (status != Status.Active) {
            revert IncidentNotActive();
        }

        if (offerId >= offersCount) {
            revert OfferDoesNotExist();
        }

        Offer storage offer = offers[offerId];

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
            protocolName,
            offer.returnAmount
        );
    }

    function _acceptOfferHacker(Offer storage offer) internal onlyHacker {
        offer.accepted = true;
        status = Status.Resolved;

        weth.safeTransfer(owner(), offer.returnAmount);
    }

    function _acceptOfferProtocol(Offer storage offer) internal onlyOwner {
        offer.accepted = true;
        status = Status.Resolved;

        weth.safeTransferFrom(hackerAddress, _msgSender(), offer.returnAmount);
    }
}