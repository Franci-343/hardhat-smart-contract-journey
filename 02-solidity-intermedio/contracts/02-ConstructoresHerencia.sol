// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Cuando el padre tiene constructor con parametros, el hijo debe pasarselos.
// Los constructores se ejecutan del MAS BASE al MAS DERIVADO:
// Persona -> Empleado -> Gerente.
contract Persona {
    string public nombre;
    uint256 public edad;
    string[] private _ordenConstruccion;

    constructor(string memory nombre_, uint256 edad_) {
        nombre = nombre_;
        edad = edad_;
        _ordenConstruccion.push("Persona");
    }

    function presentarse() public view virtual returns (string memory) {
        return nombre;
    }

    function ordenConstruccion() external view returns (string[] memory) {
        return _ordenConstruccion;
    }

    function _registrar(string memory contrato) internal {
        _ordenConstruccion.push(contrato);
    }
}

contract Empleado is Persona {
    uint256 public salario;

    // Los argumentos del constructor del padre se pasan en la firma.
    constructor(string memory nombre_, uint256 edad_, uint256 salario_) Persona(nombre_, edad_) {
        salario = salario_;
        _registrar("Empleado");
    }

    // `super` llama a la version del padre en la cadena de herencia.
    function presentarse() public view virtual override returns (string memory) {
        return string.concat(super.presentarse(), " (empleado)");
    }
}

contract Gerente is Empleado {
    string public area;

    constructor(
        string memory nombre_,
        uint256 edad_,
        uint256 salario_,
        string memory area_
    ) Empleado(nombre_, edad_, salario_) {
        area = area_;
        _registrar("Gerente");
    }

    function presentarse() public view override returns (string memory) {
        // super.presentarse() -> Empleado.presentarse() -> Persona.presentarse()
        return string.concat(super.presentarse(), " de ", area);
    }
}
