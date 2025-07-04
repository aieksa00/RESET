// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IIncident {
    function newOffer(uint256 _returnAmount, uint256 _validUntil) external;

    function acceptOffer(uint256 _offerId) external;

    function rejectOffer(uint256 _offerId) external;

    function getHackerAddress() external view returns (address);

    function getStatus() external view returns (uint8);

    function getOffer(uint256 _offerId) external view returns (uint8, uint256, uint256, uint8);
}