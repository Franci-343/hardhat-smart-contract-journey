// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Un contrato abstracto tiene al menos una funcion sin implementar.
// No se puede desplegar directamente: sirve como plantilla para los hijos.
abstract contract Figura {
    string public nombre;

    constructor(string memory nombre_) {
        nombre = nombre_;
    }

    // Sin cuerpo: los hijos estan obligados a implementarlas.
    function area() public view virtual returns (uint256);

    function perimetro() public view virtual returns (uint256);

    // Funcion ya implementada que usa las abstractas (patron "template method").
    function areaSobrePerimetro() public view returns (uint256) {
        return area() / perimetro();
    }
}

contract Rectangulo is Figura {
    uint256 public ancho;
    uint256 public alto;

    constructor(uint256 ancho_, uint256 alto_) Figura("Rectangulo") {
        ancho = ancho_;
        alto = alto_;
    }

    function area() public view override returns (uint256) {
        return ancho * alto;
    }

    function perimetro() public view override returns (uint256) {
        return 2 * (ancho + alto);
    }
}

// Triangulo rectangulo: base, altura e hipotenusa como datos de entrada.
contract Triangulo is Figura {
    uint256 public base;
    uint256 public altura;
    uint256 public hipotenusa;

    constructor(uint256 base_, uint256 altura_, uint256 hipotenusa_) Figura("Triangulo") {
        base = base_;
        altura = altura_;
        hipotenusa = hipotenusa_;
    }

    function area() public view override returns (uint256) {
        return (base * altura) / 2;
    }

    function perimetro() public view override returns (uint256) {
        return base + altura + hipotenusa;
    }
}
