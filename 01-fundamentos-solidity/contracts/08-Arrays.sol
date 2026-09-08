// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Arrays {
    uint256[] private numbers;

    function addNumber(uint256 number) external {
        numbers.push(number);
    }

    function getNumber(uint256 index) external view returns (uint256) {
        require(index < numbers.length, "Index out of bounds");
        return numbers[index];
    }

    function getNumbers() external view returns (uint256[] memory) {
        return numbers;
    }

    function length() external view returns (uint256) {
        return numbers.length;
    }

    function updateNumber(uint256 index, uint256 newNumber) external {
        require(index < numbers.length, "Index out of bounds");
        numbers[index] = newNumber;
    }

    function removeLast() external {
        require(numbers.length > 0, "Array is empty");
        numbers.pop();
    }

    function sum() external view returns (uint256) {
        uint256 total;

        for (uint256 i = 0; i < numbers.length; i++) {
            total += numbers[i];
        }

        return total;
    }
}
