// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Herencia simple: Perro y Cachorro heredan de Animal.
// - `virtual`: la funcion PUEDE ser reemplazada por un contrato hijo.
// - `override`: la funcion reemplaza a la del contrato padre.
contract Animal {
    string public especie = "Animal";

    function sonido() public pure virtual returns (string memory) {
        return "...";
    }

    // Esta funcion vive en el padre pero llama a sonido(): si el hijo lo
    // reemplaza, se ejecuta la version del hijo (polimorfismo).
    function presentarse() public view returns (string memory) {
        return string.concat(especie, " dice: ", sonido());
    }
}

contract Perro is Animal {
    constructor() {
        especie = "Perro";
    }

    function sonido() public pure virtual override returns (string memory) {
        return "Guau";
    }
}

// Herencia de varios niveles: Cachorro -> Perro -> Animal.
contract Cachorro is Perro {
    constructor() {
        especie = "Cachorro";
    }

    function sonido() public pure override returns (string memory) {
        return "Guau suave";
    }
}

// Herencia multiple: un contrato puede heredar de varios padres.
contract Volador {
    function moverse() public pure virtual returns (string memory) {
        return "Vuela";
    }
}

contract Nadador {
    function moverse() public pure virtual returns (string memory) {
        return "Nada";
    }
}

// Si dos padres definen la misma funcion, el hijo esta OBLIGADO a
// sobrescribirla e indicar de cuales padres viene: override(Volador, Nadador).
contract Pato is Volador, Nadador {
    function moverse() public pure override(Volador, Nadador) returns (string memory) {
        return string.concat(Volador.moverse(), " y ", Nadador.moverse());
    }
}
