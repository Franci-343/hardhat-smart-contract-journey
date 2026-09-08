// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Payable {
    address payable public owner;
    mapping(address => uint256) public deposits;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {
        deposits[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function deposit() external payable {
        require(msg.value > 0, "Send ETH");
        deposits[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        require(amount <= address(this).balance, "Insufficient contract balance");

        (bool success, ) = owner.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(owner, amount);
    }
}
