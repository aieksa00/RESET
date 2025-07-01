// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IMailbox {
    function CHAT_INTRO_MESSAGE() external view returns (string memory);

    function publicKeys(address user) external view returns (bytes memory);

    function registerPublicKey(bytes calldata _publicKey) external;

    function signContract(address _incidentAddress, bytes calldata _contractData) external;

    function sendMessage(address _incidentAddress, address _to, bytes calldata _encryptedMessage) external;

    function getPublicKey(address _user) external view returns (bytes memory);
}