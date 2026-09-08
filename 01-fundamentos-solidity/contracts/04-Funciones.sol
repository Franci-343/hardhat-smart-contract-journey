// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Funciones {
    uint256 public counter;

    function increment() external {
        counter += 1;
    }

    function decrement() external {
        require(counter > 0, "Counter is zero");
        counter -= 1;
    }

    function add(uint256 a, uint256 b) external pure returns (uint256) {
        return a + b;
    }

    function multiply(uint256 a, uint256 b) external pure returns (uint256) {
        return a * b;
    }

    function getCounter() external view returns (uint256) {
        return counter;
    }

    function reset() external {
        counter = 0;
    }
}
