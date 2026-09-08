// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract HelloWorld {
    string public message;

    constructor() {
        message = "Hola, Solidity";
    }

    function setMessage(string calldata newMessage) external {
        message = newMessage;
    }
}
