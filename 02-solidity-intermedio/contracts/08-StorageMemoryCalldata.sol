// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

struct Usuario {
    string nombre;
    uint256 puntos;
}

// Las tres "ubicaciones de datos" para tipos por referencia (arrays, structs, strings):
// - storage:  datos persistentes en la blockchain. Caro. Una variable `storage` es un puntero.
// - memory:   copia temporal que vive mientras dura la llamada. Modificable.
// - calldata: datos de entrada de una funcion external. Solo lectura y sin copia (mas barato).
contract StorageMemoryCalldata {
    Usuario[] public usuarios;

    function agregarUsuario(string calldata nombre, uint256 puntos) external {
        usuarios.push(Usuario(nombre, puntos));
    }

    // `storage`: u apunta al usuario real, asi que el cambio SE GUARDA.
    function sumarPuntosEnStorage(uint256 indice, uint256 extra) external {
        Usuario storage u = usuarios[indice];
        u.puntos += extra;
    }

    // `memory`: u es una COPIA. Se modifica la copia y el storage no cambia.
    function sumarPuntosEnMemory(uint256 indice, uint256 extra) external view returns (uint256) {
        Usuario memory u = usuarios[indice];
        u.puntos += extra;
        return u.puntos;
    }

    // calldata: lee directo de los datos de la transaccion, sin copiarlos.
    function sumarCalldata(uint256[] calldata datos) external pure returns (uint256 total) {
        for (uint256 i = 0; i < datos.length; i++) {
            total += datos[i];
        }
    }

    // memory: el array se copia a memoria antes de ejecutar. Mismo resultado, mas gas.
    function sumarMemory(uint256[] memory datos) external pure returns (uint256 total) {
        for (uint256 i = 0; i < datos.length; i++) {
            total += datos[i];
        }
    }

    // En memory se pueden crear arrays nuevos y modificarlos.
    function duplicar(uint256[] calldata datos) external pure returns (uint256[] memory resultado) {
        resultado = new uint256[](datos.length);

        for (uint256 i = 0; i < datos.length; i++) {
            resultado[i] = datos[i] * 2;
        }
    }

    function totalUsuarios() external view returns (uint256) {
        return usuarios.length;
    }
}
