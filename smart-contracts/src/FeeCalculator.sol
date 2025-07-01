// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./interfaces/IFeeCalculator.sol";

contract FeeCalculator is IFeeCalculator, Ownable2Step {
    error InvalidInput();
    error TimelockNotExpired();
    error DurationMustBeGreaterThanZero();
    error InvalidAddress();
    error StalePrice();

    AggregatorV3Interface public priceFeed;

    // Fee tiers and percentages (in basis points, e.g., 100 = 1%)
    uint256[] public usdTiers; // e.g. [100_000, 1_000_000, 10_000_000]
    uint256[] public bpsTiers; // length = usdTiers.length + 1

    uint256 public timelockDuration;
    uint256[] public pendingUsdTiers;
    uint256[] public pendingBpsTiers;
    uint256 public feeChangeTimestamp;

    uint256 public pendingTimelockDuration;
    uint256 public timelockChangeTimestamp;

    address public pendingPriceFeed;
    uint256 public priceFeedChangeTimestamp;

    constructor(
        address _priceFeed,
        uint256 _timelockDuration,
        uint256[] memory _usdTiers,
        uint256[] memory _bpsTiers
    ) Ownable(_msgSender()) {
        if (_bpsTiers.length != _usdTiers.length + 1) {
            revert InvalidInput();
        }
        priceFeed = AggregatorV3Interface(_priceFeed);
        usdTiers = _usdTiers;
        bpsTiers = _bpsTiers;
        timelockDuration = _timelockDuration;
    }

    function scheduleFeeTiers(uint256[] calldata _usdTiers, uint256[] calldata _bpsTiers) external onlyOwner {
        if (_bpsTiers.length != _usdTiers.length + 1) {
            revert InvalidInput();
        }
        pendingUsdTiers = _usdTiers;
        pendingBpsTiers = _bpsTiers;
        feeChangeTimestamp = block.timestamp + timelockDuration;
    }

    function executeFeeTiers() external onlyOwner {
        if (feeChangeTimestamp == 0 || block.timestamp < feeChangeTimestamp) {
            revert TimelockNotExpired();
        }
        usdTiers = pendingUsdTiers;
        bpsTiers = pendingBpsTiers;
        delete pendingUsdTiers;
        delete pendingBpsTiers;
        feeChangeTimestamp = 0;
    }

    function scheduleTimelockDuration(uint256 _newDuration) external onlyOwner {
        if (_newDuration == 0) {
            revert DurationMustBeGreaterThanZero();
        }
        pendingTimelockDuration = _newDuration;
        timelockChangeTimestamp = block.timestamp + timelockDuration;
    }

    function executeTimelockDuration() external onlyOwner {
        if (timelockChangeTimestamp == 0 || block.timestamp < timelockChangeTimestamp) {
            revert TimelockNotExpired();
        }
        timelockDuration = pendingTimelockDuration;
        pendingTimelockDuration = 0;
        timelockChangeTimestamp = 0;
    }

    function schedulePriceFeed(address _newPriceFeed) external onlyOwner {
        if (_newPriceFeed == address(0)) {
            revert InvalidAddress();
        }
        pendingPriceFeed = _newPriceFeed;
        priceFeedChangeTimestamp = block.timestamp + timelockDuration;
    }

    function executePriceFeed() external onlyOwner {
        if (priceFeedChangeTimestamp == 0 || block.timestamp < priceFeedChangeTimestamp) {
            revert TimelockNotExpired();
        }
        priceFeed = AggregatorV3Interface(pendingPriceFeed);
        pendingPriceFeed = address(0);
        priceFeedChangeTimestamp = 0;
    }

    function getLatestEthUsdPrice() public view returns (uint256) {
        (, int256 price, , uint256 updatedAt,) = priceFeed.latestRoundData();
        if (updatedAt < block.timestamp - 30 minutes) {
            revert StalePrice();
        }
        return uint256(price);
    }

    // Binary search for tier index
    function getTierIndex(uint256 _returnAmountUsd) public view returns (uint256) {
        uint256 left = 0;
        uint256 right = usdTiers.length;
        while (left < right) {
            uint256 mid = (left + right) / 2;
            if (_returnAmountUsd <= usdTiers[mid]) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left; // index for bpsTiers
    }

    function calculateFee(uint256 _returnAmountWei) external view returns (uint256) {
        uint256 bps = getFeeBps(_returnAmountWei);
        uint256 feeWei = (_returnAmountWei * bps) / 10000;
        return feeWei;
    }

    function getFeeBps(uint256 _returnAmountWei) public view returns (uint256) {
        uint256 ethUsdPrice = getLatestEthUsdPrice();
        uint8 feedDecimals = AggregatorV3Interface(priceFeed).decimals();
        uint256 returnAmountUsd = (_returnAmountWei * ethUsdPrice) / (10 ** (18 + feedDecimals));
        uint256 idx = getTierIndex(returnAmountUsd);
        return bpsTiers[idx];
    }
}