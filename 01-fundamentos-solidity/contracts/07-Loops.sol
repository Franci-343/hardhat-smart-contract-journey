// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Loops {
    function sumUntil(uint256 limit) external pure returns (uint256) {
        uint256 total;

        for (uint256 i = 1; i <= limit; i++) {
            total += i;
        }

        return total;
    }

    function countEven(uint256 limit) external pure returns (uint256) {
        uint256 count;
        uint256 current;

        while (current <= limit) {
            if (current % 2 == 0) {
                count += 1;
            }

            current += 1;
        }

        return count;
    }

    function firstMultipleOfFive(uint256[] calldata numbers) external pure returns (uint256) {
        for (uint256 i = 0; i < numbers.length; i++) {
            if (numbers[i] % 5 == 0) {
                return numbers[i];
            }
        }

        return 0;
    }
}
