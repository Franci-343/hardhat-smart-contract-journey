// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Storage se organiza en slots de 32 bytes. Los campos de un struct se
// acomodan en ESE orden, uno tras otro, y varios campos chicos comparten un
// slot si entran juntos. Un uint256 en medio de campos chicos "corta" el
// empaquetado y obliga a empezar un slot nuevo.
//
// Ambos structs guardan exactamente los mismos datos. Solo cambia el orden
// de declaracion.
contract GasPackingStorage {
    // slot 0: a (16 de 32 bytes usados, 16 se pierden)
    // slot 1: b (usa el slot entero)
    // slot 2: c (16) + d (16) = 32, entran juntos
    // slot 3: activo (el slot 2 ya estaba lleno)
    // Total: 4 slots.
    struct Desordenado {
        uint128 a;
        uint256 b;
        uint128 c;
        uint128 d;
        bool activo;
    }

    // slot 0: b (usa el slot entero)
    // slot 1: a (16) + c (16) = 32, entran juntos
    // slot 2: d (16) + activo (1) = 17, entran juntos
    // Total: 3 slots.
    struct Empacado {
        uint256 b;
        uint128 a;
        uint128 c;
        uint128 d;
        bool activo;
    }

    Desordenado[] public desordenados;
    Empacado[] public empacados;

    function agregarDesordenado(uint128 a, uint256 b, uint128 c, uint128 d, bool activo) external {
        desordenados.push(Desordenado(a, b, c, d, activo));
    }

    function agregarEmpacado(uint128 a, uint256 b, uint128 c, uint128 d, bool activo) external {
        empacados.push(Empacado(b, a, c, d, activo));
    }

    function totalDesordenados() external view returns (uint256) {
        return desordenados.length;
    }

    function totalEmpacados() external view returns (uint256) {
        return empacados.length;
    }
}
