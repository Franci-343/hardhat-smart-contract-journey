// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Assembly (Yul) da acceso directo a los opcodes de la EVM, sin las
// protecciones ni el azucar sintactico de Solidity. Sirve para casos muy
// puntuales donde Solidity no alcanza o es mas caro de lo necesario. Fuera
// de esos casos, Solidity normal es mas seguro y mas facil de leer: no se
// usa assembly "porque se puede".
//
// Cada funcion de aca tiene su version normal al lado, para comparar.
contract AssemblyYul {
    uint256 public valorGuardado = 777;

    // ---- Leer un slot de storage ----
    //
    // `valorGuardado.slot` le pregunta al COMPILADOR en que slot vive esa
    // variable: no hay que adivinar ni escribir el numero a mano.
    function leerConAssembly() external view returns (uint256 resultado) {
        assembly {
            resultado := sload(valorGuardado.slot)
        }
    }

    function leerNormal() external view returns (uint256) {
        return valorGuardado;
    }

    // ---- Sumar un array recibido por calldata ----
    //
    // `datos.offset` y `datos.length` le piden al compilador la posicion y
    // el largo del array dentro del calldata: tampoco hay aritmetica de ABI
    // a mano. `calldataload` lee 32 bytes crudos desde esa posicion.
    function sumarConAssembly(uint256[] calldata datos) external pure returns (uint256 total) {
        assembly {
            let len := datos.length
            let ptr := datos.offset

            for {
                let i := 0
            } lt(i, len) {
                i := add(i, 1)
            } {
                total := add(total, calldataload(add(ptr, mul(i, 0x20))))
            }
        }
    }

    function sumarNormal(uint256[] calldata datos) external pure returns (uint256 total) {
        uint256 longitud = datos.length;

        for (uint256 i = 0; i < longitud; i++) {
            total += datos[i];
        }
    }

    // ---- Saber si una direccion tiene codigo (es un contrato) ----
    //
    // Antes de que existiera `direccion.code.length`, esta era la unica
    // forma de hacer esta pregunta: leer directamente el opcode EXTCODESIZE.
    // Hoy Solidity ya expone `.code.length`, que hace exactamente esto.
    function esContratoConAssembly(address cuenta) external view returns (bool resultado) {
        assembly {
            resultado := gt(extcodesize(cuenta), 0)
        }
    }

    function esContratoNormal(address cuenta) external view returns (bool) {
        return cuenta.code.length > 0;
    }
}
