// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// - constant: valor fijo conocido al COMPILAR. No ocupa slot de storage.
// - immutable: valor fijado UNA vez en el constructor. Se guarda en el bytecode.
// - variable normal: vive en storage y cada lectura cuesta un SLOAD.
contract ConstantImmutable {
    uint256 public constant MAX_SUPPLY = 1_000_000;
    string public constant NOMBRE = "Curso Intermedio";

    address public immutable OWNER;
    uint256 public immutable CREADO_EN;
    uint256 public immutable FEE_BPS;

    // Misma informacion que FEE_BPS, pero guardada en storage para comparar gas.
    uint256 public feeEnStorage;

    error FeeInvalido(uint256 fee);

    constructor(uint256 feeBps) {
        if (feeBps > 10_000) revert FeeInvalido(feeBps);

        OWNER = msg.sender;
        CREADO_EN = block.timestamp;
        FEE_BPS = feeBps;
        feeEnStorage = feeBps;
    }

    function calcularFeeConImmutable(uint256 monto) external view returns (uint256) {
        return (monto * FEE_BPS) / 10_000;
    }

    function calcularFeeConStorage(uint256 monto) external view returns (uint256) {
        return (monto * feeEnStorage) / 10_000;
    }
}
