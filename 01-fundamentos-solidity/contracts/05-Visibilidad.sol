// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Visibilidad {
    uint256 public publicNumber = 1;
    uint256 private privateNumber = 2;
    uint256 internal internalNumber = 3;

    function externalFunction() external pure returns (string memory) {
        return "external";
    }

    function publicFunction() public pure returns (string memory) {
        return "public";
    }

    function getPrivateNumber() external view returns (uint256) {
        return privateNumber;
    }

    function callInternalFunction() external view returns (uint256) {
        return internalFunction();
    }

    function internalFunction() internal view returns (uint256) {
        return internalNumber;
    }

    function privateFunction() private pure returns (string memory) {
        return "private";
    }

    function callPrivateFunction() external pure returns (string memory) {
        return privateFunction();
    }
}

contract VisibilidadHija is Visibilidad {
    function readInternalNumber() external view returns (uint256) {
        return internalNumber;
    }
}
