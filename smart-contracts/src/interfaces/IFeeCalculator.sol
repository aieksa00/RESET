// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IFeeCalculator {
    function scheduleFeeTiers(uint256[] calldata _usdTiers, uint256[] calldata _bpsTiers) external;
    
    function executeFeeTiers() external;
    
    function scheduleTimelockDuration(uint256 _newDuration) external;
    
    function executeTimelockDuration() external;
    
    function schedulePriceFeed(address _newPriceFeed) external;
    
    function executePriceFeed() external;
    
    function getLatestEthUsdPrice() external view returns (uint256);
    
    function getTierIndex(uint256 _returnAmountUsd) external view returns (uint256);
    
    function calculateFee(uint256 _returnAmountWei) external view returns (uint256);
    
    function getFeeBps(uint256 _returnAmountWei) external view returns (uint256);
}
