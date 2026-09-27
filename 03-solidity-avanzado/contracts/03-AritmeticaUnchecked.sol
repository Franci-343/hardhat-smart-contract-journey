// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Desde Solidity 0.8, +, -, *, / y ** revierten SOLOS si el resultado no
// entra en el tipo (overflow) o si un unsigned se va por debajo de cero
// (underflow). `unchecked { ... }` apaga esa proteccion dentro del bloque,
// a cambio de menos gas. Apagarla donde no corresponde reintroduce los
// bugs que Solidity 0.8 vino a evitar.
contract AritmeticaUnchecked {
    mapping(address => uint256) public balances;

    function depositar() external payable {
        balances[msg.sender] += msg.value;
    }

    // VULNERABLE: si `monto` > balance, esta resta NO revierte. Da la
    // vuelta (underflow) y balances[msg.sender] queda con un numero
    // gigantesco, cercano a type(uint256).max.
    function retirarSinCheckVulnerable(uint256 monto) external {
        unchecked {
            balances[msg.sender] -= monto;
        }
    }

    // Correcto: la resta normal revierte sola con Panic(0x11) si
    // monto > balance. No hace falta un require adicional.
    function retirarConCheck(uint256 monto) external {
        balances[msg.sender] -= monto;
    }

    // Una suma que "da la vuelta": unchecked permite pasar de
    // type(uint256).max de regreso a un numero chico.
    function sumarConOverflow(uint256 a, uint256 b) external pure returns (uint256) {
        unchecked {
            return a + b;
        }
    }

    function sumarConCheck(uint256 a, uint256 b) external pure returns (uint256) {
        return a + b;
    }

    // Las conversiones de tipo (downcast) NUNCA revierten por perdida de
    // datos, ni dentro ni fuera de un bloque unchecked: son un descarte de
    // bits (x % 2**8), no una operacion aritmetica protegida.
    function truncarAUint8(uint256 x) external pure returns (uint8) {
        return uint8(x);
    }

    // Buen uso de unchecked: el contador de un for nunca puede desbordar
    // dentro de los limites del propio bucle (length siempre cabe en
    // uint256), asi que el chequeo automatico en ++i es gasto puro.
    function sumarArray(uint256[] calldata datos) external pure returns (uint256 total) {
        uint256 length = datos.length;

        for (uint256 i = 0; i < length; ) {
            total += datos[i];

            unchecked {
                ++i;
            }
        }
    }
}
