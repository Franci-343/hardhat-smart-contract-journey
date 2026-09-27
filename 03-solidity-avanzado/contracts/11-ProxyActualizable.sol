// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Reglas para escribir una implementacion UUPS (Universal Upgradeable Proxy
// Standard):
//
// 1. Nunca inicializar estado en el constructor. El constructor corre en la
//    direccion de la LOGICA, no en la del proxy; su storage nunca es el que
//    usaran los usuarios (el proxy tiene su propio storage, vacio).
// 2. En cambio, se usa una funcion initialize() comun, protegida para que
//    solo se pueda ejecutar una vez.
// 3. El constructor SI se usa, pero solo para marcar la direccion de la
//    logica (no la del proxy) como "ya inicializada", y asi impedir que
//    alguien llame a initialize() directamente sobre la logica, sin pasar
//    por ningun proxy.
abstract contract BaseActualizable {
    bool private _inicializado;

    error YaInicializado();

    modifier inicializador() {
        if (_inicializado) revert YaInicializado();
        _inicializado = true;
        _;
    }

    constructor() {
        _inicializado = true;
    }
}

// El slot donde vive la direccion de la implementacion. Es el mismo de
// EIP-1967 que en la leccion 10 (keccak256("eip1967.proxy.implementation") - 1),
// para que herramientas como Etherscan sepan donde buscarlo.
bytes32 constant SLOT_IMPLEMENTACION = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

// ============================================================================
// V1: version inicial.
// ============================================================================
contract LogicaUUPS_V1 is BaseActualizable {
    address public owner; // comparte slot con el bool de BaseActualizable
    uint256 public valor; // slot propio

    event Actualizado(address indexed implementacionAnterior, address indexed implementacionNueva);

    function initialize(address ownerInicial) external inicializador {
        owner = ownerInicial;
    }

    function establecer(uint256 nuevoValor) external {
        require(msg.sender == owner, "No autorizado");
        valor = nuevoValor;
    }

    // A diferencia del proxy de la leccion 10, la logica de actualizacion
    // vive ACA, en la implementacion, y se ejecuta via delegatecall (por
    // eso puede escribir el slot de implementacion del PROXY). Esto es lo
    // que distingue a UUPS de un proxy con un admin externo.
    function upgradeTo(address nuevaImplementacion) external {
        require(msg.sender == owner, "No autorizado");
        require(nuevaImplementacion.code.length > 0, "La implementacion debe ser un contrato");

        address anterior;
        bytes32 slot = SLOT_IMPLEMENTACION;

        assembly {
            anterior := sload(slot)
            sstore(slot, nuevaImplementacion)
        }

        emit Actualizado(anterior, nuevaImplementacion);
    }

    function implementacion() external view returns (address impl) {
        bytes32 slot = SLOT_IMPLEMENTACION;
        assembly {
            impl := sload(slot)
        }
    }
}

// ============================================================================
// V2 SEGURA: agrega una variable nueva AL FINAL. El estado existente
// (owner, valor) queda intacto porque nadie movio esos slots.
// ============================================================================
contract LogicaUUPS_V2 is BaseActualizable {
    address public owner;
    uint256 public valor;
    uint256 public extra; // nueva, agregada despues de todo lo anterior

    event Actualizado(address indexed implementacionAnterior, address indexed implementacionNueva);

    function initialize(address ownerInicial) external inicializador {
        owner = ownerInicial;
    }

    function establecer(uint256 nuevoValor) external {
        require(msg.sender == owner, "No autorizado");
        valor = nuevoValor;
    }

    function establecerExtra(uint256 nuevoValor) external {
        require(msg.sender == owner, "No autorizado");
        extra = nuevoValor;
    }

    function upgradeTo(address nuevaImplementacion) external {
        require(msg.sender == owner, "No autorizado");
        require(nuevaImplementacion.code.length > 0, "La implementacion debe ser un contrato");

        address anterior;
        bytes32 slot = SLOT_IMPLEMENTACION;

        assembly {
            anterior := sload(slot)
            sstore(slot, nuevaImplementacion)
        }

        emit Actualizado(anterior, nuevaImplementacion);
    }

    function implementacion() external view returns (address impl) {
        bytes32 slot = SLOT_IMPLEMENTACION;
        assembly {
            impl := sload(slot)
        }
    }
}

// ============================================================================
// V2 INSEGURA: agrega una variable nueva EN EL MEDIO. Todo lo que ya estaba
// guardado se desplaza de significado: se lee con la etiqueta equivocada.
// ============================================================================
contract LogicaUUPS_V2Malo is BaseActualizable {
    address public owner;
    uint256 public nueva; // <- insertada ANTES de `valor`: rompe el layout
    uint256 public valor;

    function initialize(address ownerInicial) external inicializador {
        owner = ownerInicial;
    }
}

// ============================================================================
// El proxy: a proposito, NO tiene ninguna funcion de actualizacion propia.
// Solo guarda la direccion de la implementacion y reenvia todo. La logica
// de "quien puede actualizar y como" vive en la implementacion (arriba).
// ============================================================================
contract ProxyUUPS {
    constructor(address implementacionInicial, bytes memory datosInicializacion) {
        require(implementacionInicial.code.length > 0, "La implementacion debe ser un contrato");

        bytes32 slot = SLOT_IMPLEMENTACION;
        assembly {
            sstore(slot, implementacionInicial)
        }

        if (datosInicializacion.length > 0) {
            (bool ok, ) = implementacionInicial.delegatecall(datosInicializacion);
            require(ok, "Inicializacion fallo");
        }
    }

    fallback() external payable {
        _delegar();
    }

    receive() external payable {
        _delegar();
    }

    function _delegar() internal {
        bytes32 slot = SLOT_IMPLEMENTACION;

        assembly {
            let impl := sload(slot)

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
