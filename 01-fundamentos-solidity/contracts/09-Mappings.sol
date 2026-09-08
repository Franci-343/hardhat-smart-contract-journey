// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Mappings {
    mapping(address => uint256) public balances;
    mapping(address => bool) public registered;

    function register() external {
        registered[msg.sender] = true;
    }

    function depositPoints(uint256 amount) external {
        require(registered[msg.sender], "Not registered");
        balances[msg.sender] += amount;
    }

    function transferPoints(address to, uint256 amount) external {
        require(to != address(0), "Invalid address");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function resetMyBalance() external {
        balances[msg.sender] = 0;
    }
}
