// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Eventos {
    uint256 public value;

    event ValueChanged(address indexed user, uint256 oldValue, uint256 newValue);
    event Reset(address indexed user);

    function setValue(uint256 newValue) external {
        uint256 oldValue = value;
        value = newValue;

        emit ValueChanged(msg.sender, oldValue, newValue);
    }

    function reset() external {
        value = 0;

        emit Reset(msg.sender);
    }
}
