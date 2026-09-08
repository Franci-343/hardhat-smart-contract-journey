// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract ReceiveFallback {
    uint256 public receiveCount;
    uint256 public fallbackCount;
    uint256 public totalReceived;
    bytes public lastData;

    event Received(address indexed sender, uint256 amount);
    event FallbackCalled(address indexed sender, uint256 amount, bytes data);

    receive() external payable {
        receiveCount += 1;
        totalReceived += msg.value;

        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        fallbackCount += 1;
        totalReceived += msg.value;
        lastData = msg.data;

        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
