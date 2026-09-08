// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Variables {
    string public name = "Curso Solidity";
    uint256 public totalStudents;
    bool public isActive = true;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function registerStudent() external {
        totalStudents += 1;
    }

    function updateName(string calldata newName) external {
        name = newName;
    }

    function deactivate() external {
        isActive = false;
    }

    function senderAddress() external view returns (address) {
        return msg.sender;
    }
}
