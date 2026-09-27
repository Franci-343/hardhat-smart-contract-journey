// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// ============================================================================
// PARTE 1: cachear una lectura de storage que se repite en un loop.
// ============================================================================
contract GasEnLoops {
    uint256[] public numeros;

    function agregar(uint256 valor) external {
        numeros.push(valor);
    }

    // Cada vuelta del for vuelve a leer `numeros.length` DESDE STORAGE.
    // Es una lectura de mas por cada iteracion, aunque el valor no cambia.
    function sumarSinCache() external view returns (uint256 total) {
        for (uint256 i = 0; i < numeros.length; i++) {
            total += numeros[i];
        }
    }

    // La longitud se lee UNA sola vez y se guarda en memoria (variable
    // local). El resto del loop no vuelve a tocar `numeros.length`.
    function sumarConCache() external view returns (uint256 total) {
        uint256 longitud = numeros.length;

        for (uint256 i = 0; i < longitud; i++) {
            total += numeros[i];
        }
    }
}

// ============================================================================
// PARTE 2: orden de evaluacion en && y ||.
// ============================================================================
//
// `&&` y `||` cortocircuitan: si el primer operando ya decide el resultado,
// el segundo ni se evalua. Poner la condicion MAS BARATA primero ahorra gas
// cada vez que esa condicion barata alcanza para decidir.
contract GasCortocircuito {
    mapping(address => bool) public bloqueados;
    uint256[] public datosGrandes;

    constructor() {
        for (uint256 i = 0; i < 50; i++) {
            datosGrandes.push(i);
        }
    }

    function bloquear(address cuenta) external {
        bloqueados[cuenta] = true;
    }

    // Barato primero: si `bloqueados[usuario]` ya es true, `_verificacionCara`
    // NUNCA se ejecuta.
    function ordenBarato(address usuario) external view returns (bool) {
        return !bloqueados[usuario] && _verificacionCara();
    }

    // Caro primero: siempre paga el costo completo de `_verificacionCara`,
    // incluso cuando el usuario ya estaba bloqueado y el resultado iba a
    // ser `false` de todas formas.
    function ordenCaro(address usuario) external view returns (bool) {
        return _verificacionCara() && !bloqueados[usuario];
    }

    // Simula una verificacion cara: recorre un array grande.
    function _verificacionCara() internal view returns (bool) {
        uint256 total;
        uint256 longitud = datosGrandes.length;

        for (uint256 i = 0; i < longitud; i++) {
            total += datosGrandes[i];
        }

        return total > 0;
    }
}

// ============================================================================
// PARTE 3: require con string vs errores personalizados.
// ============================================================================
//
// La comparacion justa no es "cuanto gas gasta la validacion" (el chequeo
// en si cuesta lo mismo): es el tamano del bytecode desplegado. Cada string
// de error queda grabado en el contrato para siempre; un error personalizado
// solo grabra su selector de 4 bytes cuando efectivamente se revierte.
contract ErroresConString {
    function operacionA(uint256 x) external pure returns (uint256) {
        require(x > 0, "El valor debe ser mayor a cero");
        require(x < 1_000_000, "El valor es demasiado grande");
        return x * 2;
    }

    function operacionB(address destino) external pure returns (address) {
        require(destino != address(0), "La direccion no puede ser la direccion cero");
        return destino;
    }
}

contract ErroresConCustomError {
    error ValorInvalido(uint256 x);
    error ValorDemasiadoGrande(uint256 x);
    error DireccionInvalida();

    function operacionA(uint256 x) external pure returns (uint256) {
        if (x == 0) revert ValorInvalido(x);
        if (x >= 1_000_000) revert ValorDemasiadoGrande(x);
        return x * 2;
    }

    function operacionB(address destino) external pure returns (address) {
        if (destino == address(0)) revert DireccionInvalida();
        return destino;
    }
}
