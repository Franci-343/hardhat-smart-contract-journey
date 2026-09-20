// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Una libreria agrupa funciones reutilizables sin estado propio.
// Con funciones `internal` el compilador copia el codigo dentro del contrato
// que la usa, asi que no hace falta desplegarla ni enlazarla aparte.
library MathLib {
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a <= b ? a : b;
    }

    function promedio(uint256[] memory datos) internal pure returns (uint256) {
        require(datos.length > 0, "Sin datos");

        uint256 total;
        for (uint256 i = 0; i < datos.length; i++) {
            total += datos[i];
        }

        return total / datos.length;
    }

    // Porcentaje en puntos base: 100 bps = 1%, 10_000 bps = 100%.
    function porcentaje(uint256 valor, uint256 bps) internal pure returns (uint256) {
        return (valor * bps) / 10_000;
    }
}

// Las librerias tambien pueden operar sobre variables de storage.
library ArrayLib {
    function sumar(uint256[] storage self) internal view returns (uint256 total) {
        for (uint256 i = 0; i < self.length; i++) {
            total += self[i];
        }
    }

    function contiene(uint256[] storage self, uint256 valor) internal view returns (bool) {
        for (uint256 i = 0; i < self.length; i++) {
            if (self[i] == valor) {
                return true;
            }
        }

        return false;
    }

    // Borrado rapido: mueve el ultimo elemento al hueco (no conserva el orden).
    function quitar(uint256[] storage self, uint256 indice) internal {
        require(indice < self.length, "Indice fuera de rango");

        self[indice] = self[self.length - 1];
        self.pop();
    }
}

contract Estadisticas {
    // `using X for T` permite llamar las funciones como metodos: a.max(b).
    using MathLib for uint256;
    using ArrayLib for uint256[];

    uint256[] public datos;

    function agregar(uint256 valor) external {
        datos.push(valor);
    }

    function quitar(uint256 indice) external {
        datos.quitar(indice);
    }

    function total() external view returns (uint256) {
        return datos.sumar();
    }

    function existe(uint256 valor) external view returns (bool) {
        return datos.contiene(valor);
    }

    function cantidad() external view returns (uint256) {
        return datos.length;
    }

    function mayorDe(uint256 a, uint256 b) external pure returns (uint256) {
        return a.max(b);
    }

    function menorDe(uint256 a, uint256 b) external pure returns (uint256) {
        return a.min(b);
    }

    function promedioDe(uint256[] calldata valores) external pure returns (uint256) {
        return MathLib.promedio(valores);
    }

    function comision(uint256 monto, uint256 bps) external pure returns (uint256) {
        return monto.porcentaje(bps);
    }
}
