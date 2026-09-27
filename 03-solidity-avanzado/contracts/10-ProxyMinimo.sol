// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Primera version de la logica: guarda un numero y sabe duplicarlo.
contract ImplementacionV1 {
    uint256 public valor; // slot 0

    function establecer(uint256 nuevoValor) external {
        valor = nuevoValor;
    }

    function duplicar() external {
        valor *= 2;
    }
}

// Segunda version: MISMA variable en el MISMO slot 0 (por eso el estado
// sobrevive a la actualizacion), mas una funcion nueva.
contract ImplementacionV2 {
    uint256 public valor; // slot 0, igual que en V1: el estado no se mueve

    function establecer(uint256 nuevoValor) external {
        valor = nuevoValor;
    }

    function duplicar() external {
        valor *= 2;
    }

    function triplicar() external {
        valor *= 3;
    }
}

// Un proxy minimo, inspirado en el patron transparente de EIP-1967.
//
// La idea central: el proxy tiene UNA SOLA direccion fija (la que usan los
// usuarios y otros contratos), pero cada llamada se reenvia con
// `delegatecall` a la direccion de "implementacion" guardada en un slot
// especial. Cambiar esa direccion "actualiza" el contrato sin que su
// direccion publica cambie nunca.
//
// El slot donde se guarda la implementacion no es el slot 0: es un slot
// "raro", calculado como keccak256("eip1967.proxy.implementation") - 1.
// Restar 1 hace que sea practicamente imposible que ese slot choque por
// accidente con una variable normal de la implementacion (leccion 09).
contract ProxyMinimo {
    bytes32 private constant _SLOT_IMPLEMENTACION =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    address public immutable admin;

    event Actualizado(address indexed implementacionAnterior, address indexed implementacionNueva);

    constructor(address implementacionInicial) {
        admin = msg.sender;
        _establecerImplementacion(implementacionInicial);
    }

    function implementacion() public view returns (address impl) {
        bytes32 slot = _SLOT_IMPLEMENTACION;
        assembly {
            impl := sload(slot)
        }
    }

    function actualizar(address nuevaImplementacion) external {
        require(msg.sender == admin, "No autorizado");

        address anterior = implementacion();
        _establecerImplementacion(nuevaImplementacion);

        emit Actualizado(anterior, nuevaImplementacion);
    }

    function _establecerImplementacion(address nueva) internal {
        require(nueva.code.length > 0, "La implementacion debe ser un contrato");

        bytes32 slot = _SLOT_IMPLEMENTACION;
        assembly {
            sstore(slot, nueva)
        }
    }

    // Cualquier llamada que no coincida con `implementacion()` ni
    // `actualizar()` cae aca y se reenvia a la implementacion actual.
    fallback() external payable {
        _delegar(implementacion());
    }

    receive() external payable {
        _delegar(implementacion());
    }

    function _delegar(address impl) internal {
        assembly {
            calldatacopy(0, 0, calldatasize())

            let resultado := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)

            returndatacopy(0, 0, returndatasize())

            switch resultado
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
