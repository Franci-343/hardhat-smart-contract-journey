// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Un padre para demostrar que la herencia NO reinicia la numeracion de
// slots: el hijo continua justo donde el padre termino.
contract Padre {
    uint256 public valorPadre; // slot 0 (usa el slot entero)
    address public duenoPadre; // slot 1 (20 de 32 bytes; quedan 12 libres)
}

contract StorageLayout is Padre {
    // Comparte el slot 1 con `duenoPadre`: 20 (address) + 1 (bool) = 21/32.
    bool public activo;

    // No entra en lo que quedaba del slot 1 (necesita 32 bytes completos):
    // empieza slot 2.
    uint256 public numero;

    // Un array dinamico SIEMPRE reserva su propio slot para el largo,
    // aunque el slot anterior tuviera lugar libre. Aca: slot 3.
    // Sus elementos NO viven en slot 3: viven a partir de
    // keccak256(slot 3), uno detras del otro.
    uint256[] public numeros;

    // Un mapping tambien reserva su propio slot (slot 4), pero ese slot no
    // guarda ningun dato: solo se usa como ingrediente de una formula.
    // El valor de balances[k] vive en keccak256(abi.encode(k, slot 4)).
    mapping(address => uint256) public balances;

    function fijarValores(address dueno, uint256 valorNumero) external {
        valorPadre = 111;
        duenoPadre = dueno;
        activo = true;
        numero = valorNumero;
    }

    function agregarNumero(uint256 valor) external {
        numeros.push(valor);
    }

    function fijarBalance(address cuenta, uint256 monto) external {
        balances[cuenta] = monto;
    }
}
