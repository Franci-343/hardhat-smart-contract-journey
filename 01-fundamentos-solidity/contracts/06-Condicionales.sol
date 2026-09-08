// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Condicionales {
    function isAdult(uint256 age) external pure returns (bool) {
        if (age >= 18) {
            return true;
        }

        return false;
    }

    function grade(uint256 score) external pure returns (string memory) {
        if (score >= 90) {
            return "A";
        } else if (score >= 75) {
            return "B";
        } else if (score >= 60) {
            return "C";
        }

        return "F";
    }

    function max(uint256 a, uint256 b) external pure returns (uint256) {
        return a >= b ? a : b;
    }

    function canWithdraw(uint256 balance, uint256 amount) external pure returns (bool) {
        return amount > 0 && balance >= amount;
    }
}
