// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// La implementacion que se va a clonar muchas veces. Cada clon comparte
// este MISMO codigo (via delegatecall) pero tiene su PROPIO storage.
contract PlantillaContador {
    uint256 public contador;
    address public dueno;

    // Los clones no tienen constructor propio (heredan el bytecode fijo del
    // clon, no el de esta plantilla): se inicializan con una funcion normal,
    // igual que en el patron UUPS de la leccion 11.
    function inicializar(address duenoInicial) external {
        require(dueno == address(0), "Ya inicializado");
        dueno = duenoInicial;
    }

    function incrementar() external {
        require(msg.sender == dueno, "No autorizado");
        contador += 1;
    }
}

// Crea copias baratas de PlantillaContador usando el patron EIP-1167
// ("clon minimo"): en vez de desplegar el bytecode completo de la
// implementacion una y otra vez, cada clon es un contrato de 45 bytes que
// solo sabe hacer una cosa: delegatecall a la implementacion original.
contract FabricaClones {
    event ClonCreado(address indexed clon, address indexed implementacion);

    // Bytecode de creacion de un clon minimo (EIP-1167). Los primeros 10
    // bytes copian y devuelven los 45 bytes de runtime que siguen; esos 45
    // bytes son: un prefijo fijo (10 bytes) + la direccion de la
    // implementacion (20 bytes) + un sufijo fijo (15 bytes) que hace el
    // delegatecall y reenvia el resultado tal cual.
    bytes10 private constant _PREFIJO_CREACION = 0x3d602d80600a3d3981f3;
    bytes10 private constant _PREFIJO_RUNTIME = 0x363d3d373d3d3d363d73;
    bytes15 private constant _SUFIJO_RUNTIME = 0x5af43d82803e903d91602b57fd5bf3;

    function _bytecodeClon(address implementacion) private pure returns (bytes memory) {
        return abi.encodePacked(_PREFIJO_CREACION, _PREFIJO_RUNTIME, implementacion, _SUFIJO_RUNTIME);
    }

    // Direccion "normal": depende del nonce de esta fabrica, como cualquier
    // `new Contrato()`. No se puede predecir de antemano con precision util.
    function clonar(address implementacion) external returns (address clon) {
        bytes memory codigo = _bytecodeClon(implementacion);

        assembly {
            clon := create(0, add(codigo, 0x20), mload(codigo))
        }

        require(clon != address(0), "Clonacion fallida");
        emit ClonCreado(clon, implementacion);
    }

    // Direccion DETERMINISTICA: depende solo de (esta fabrica, el bytecode
    // del clon, el salt). Se puede calcular con calcularDireccion() ANTES
    // de desplegar nada.
    function clonarDeterministico(address implementacion, bytes32 salt) external returns (address clon) {
        bytes memory codigo = _bytecodeClon(implementacion);

        assembly {
            clon := create2(0, add(codigo, 0x20), mload(codigo), salt)
        }

        require(clon != address(0), "Clonacion fallida");
        emit ClonCreado(clon, implementacion);
    }

    // Misma formula que usa la EVM para CREATE2:
    // address = ultimos 20 bytes de keccak256(0xff ++ creador ++ salt ++ keccak256(codigo_de_creacion))
    function calcularDireccion(address implementacion, bytes32 salt) external view returns (address predicho) {
        bytes32 hashBytecode = keccak256(_bytecodeClon(implementacion));

        predicho = address(
            uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, hashBytecode))))
        );
    }
}
