// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Contrato que falla de distintas maneras.
contract Riesgoso {
    error SaldoInsuficiente(uint256 pedido, uint256 disponible);

    // Panic 0x12: division entre cero.
    function dividir(uint256 a, uint256 b) external pure returns (uint256) {
        return a / b;
    }

    // Error(string) por require.
    function exigirPositivo(uint256 x) external pure returns (uint256) {
        require(x > 0, "x debe ser mayor a cero");
        return x;
    }

    // Error personalizado.
    function retirar(uint256 pedido) external pure returns (uint256) {
        if (pedido > 10) revert SaldoInsuficiente(pedido, 10);
        return pedido;
    }

    // Panic 0x01: assert fallido.
    function romperInvariante() external pure {
        assert(false);
    }
}

// Constructor que puede fallar: se prueba con `try new`.
contract Fragil {
    uint256 public valor;

    constructor(uint256 valor_) {
        require(valor_ != 0, "Valor no puede ser cero");
        valor = valor_;
    }
}

// try/catch solo funciona con llamadas EXTERNAS y con `new`.
// No sirve para funciones internas del mismo contrato.
contract TryCatch {
    Riesgoso public immutable riesgoso;

    constructor() {
        riesgoso = new Riesgoso();
    }

    // catch Error(string): atrapa require/revert con mensaje.
    function probarRequire(uint256 x) external view returns (bool exito, string memory razon) {
        try riesgoso.exigirPositivo(x) returns (uint256) {
            return (true, "");
        } catch Error(string memory mensaje) {
            return (false, mensaje);
        }
    }

    // catch Panic(uint256): atrapa errores de bajo nivel del compilador (0x11 overflow, 0x12 division, ...).
    function probarDivision(uint256 a, uint256 b) external view returns (bool exito, uint256 codigoPanic) {
        try riesgoso.dividir(a, b) returns (uint256) {
            return (true, 0);
        } catch Panic(uint256 codigo) {
            return (false, codigo);
        }
    }

    function probarAssert() external view returns (uint256 codigoPanic) {
        try riesgoso.romperInvariante() {
            return 0;
        } catch Panic(uint256 codigo) {
            return codigo;
        }
    }

    // catch (bytes memory): atrapa cualquier otro fallo, incluidos errores personalizados.
    // Se identifican comparando los primeros 4 bytes (el selector del error).
    function probarErrorPersonalizado(uint256 pedido) external view returns (bool exito, bool esSaldoInsuficiente) {
        try riesgoso.retirar(pedido) returns (uint256) {
            return (true, false);
        } catch (bytes memory datos) {
            return (false, bytes4(datos) == Riesgoso.SaldoInsuficiente.selector);
        }
    }

    // try new: atrapa fallos del constructor del contrato que se crea.
    function crearFragil(uint256 valor) external returns (address creado, string memory razon) {
        try new Fragil(valor) returns (Fragil nuevo) {
            return (address(nuevo), "");
        } catch Error(string memory mensaje) {
            return (address(0), mensaje);
        }
    }
}
