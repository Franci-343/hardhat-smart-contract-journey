// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Una interfaz solo declara QUE se puede hacer, no COMO.
// Reglas: todas las funciones son external, sin estado y sin constructor.
interface IAlmacen {
    event Guardado(address indexed por, uint256 valor);

    function guardar(uint256 valor) external;

    function obtener() external view returns (uint256);
}

// Primera implementacion: guarda el valor tal cual.
contract AlmacenSimple is IAlmacen {
    uint256 private _valor;

    function guardar(uint256 valor) external {
        _valor = valor;
        emit Guardado(msg.sender, valor);
    }

    function obtener() external view returns (uint256) {
        return _valor;
    }
}

// Segunda implementacion: guarda el doble. Misma interfaz, otro comportamiento.
contract AlmacenDoble is IAlmacen {
    uint256 private _valor;

    function guardar(uint256 valor) external {
        _valor = valor * 2;
        emit Guardado(msg.sender, _valor);
    }

    function obtener() external view returns (uint256) {
        return _valor;
    }
}

// Este contrato no sabe con cual implementacion habla: solo conoce la interfaz.
contract ClienteAlmacen {
    function guardarEn(address almacen, uint256 valor) external {
        IAlmacen(almacen).guardar(valor);
    }

    function leerDe(address almacen) external view returns (uint256) {
        return IAlmacen(almacen).obtener();
    }

    // interfaceId = XOR de los selectores de todas las funciones de la interfaz.
    // Es la base del estandar ERC-165.
    function idInterfaz() external pure returns (bytes4) {
        return type(IAlmacen).interfaceId;
    }
}
