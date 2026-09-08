// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract TiposDeDatos {
    bool public completed = false;
    int256 public temperature = -5;
    uint256 public score = 100;
    address public teacher;
    bytes32 public courseId = keccak256("SOLIDITY_FUNDAMENTOS");
    string public title = "Tipos de datos";

    constructor() {
        teacher = msg.sender;
    }

    function updateCompleted(bool value) external {
        completed = value;
    }

    function updateTemperature(int256 value) external {
        temperature = value;
    }

    function updateScore(uint256 value) external {
        score = value;
    }

    function getExampleTuple()
        external
        view
        returns (bool, int256, uint256, address, bytes32, string memory)
    {
        return (completed, temperature, score, teacher, courseId, title);
    }
}
