// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Errores {
    address public owner;
    uint256 public balance;

    error NotOwner(address caller);
    error InvalidAmount();
    error InsufficientBalance(uint256 available, uint256 required);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner(msg.sender);
        }

        _;
    }

    function deposit(uint256 amount) external {
        if (amount == 0) {
            revert InvalidAmount();
        }

        balance += amount;
    }

    function withdraw(uint256 amount) external onlyOwner {
        if (amount == 0) {
            revert InvalidAmount();
        }

        if (balance < amount) {
            revert InsufficientBalance(balance, amount);
        }

        balance -= amount;
    }
}
