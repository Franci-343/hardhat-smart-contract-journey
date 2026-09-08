// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract RequireAssertRevert {
    uint256 public total;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function add(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        uint256 oldTotal = total;
        total += amount;

        assert(total >= oldTotal);
    }

    function onlyOwnerAction() external view returns (string memory) {
        if (msg.sender != owner) {
            revert("Only owner can call this function");
        }

        return "Owner action executed";
    }

    function reset() external {
        require(msg.sender == owner, "Only owner");
        total = 0;
    }
}
