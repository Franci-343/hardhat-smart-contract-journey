// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Contrato "destino": guarda quien lo llamo.
contract Contador {
    uint256 public valor;
    address public ultimoSender;
    address public ultimoOrigen;

    function incrementar() external returns (uint256) {
        valor++;
        // msg.sender: quien llamo DIRECTAMENTE a este contrato (puede ser otro contrato).
        ultimoSender = msg.sender;
        // tx.origin: la cuenta externa (EOA) que firmo la transaccion. No usar para autorizar.
        ultimoOrigen = tx.origin;
        return valor;
    }

    function establecer(uint256 nuevoValor) external {
        valor = nuevoValor;
        ultimoSender = msg.sender;
        ultimoOrigen = tx.origin;
    }
}

// Interfaz minima para hablar con Contador sin importar su codigo completo.
interface IContador {
    function incrementar() external returns (uint256);

    function establecer(uint256 nuevoValor) external;

    function valor() external view returns (uint256);
}

// Llama a otro contrato a traves de su interfaz.
// Para Contador, msg.sender sera la direccion de este contrato, no la del usuario.
contract Llamador {
    IContador public immutable contador;

    constructor(address contador_) {
        contador = IContador(contador_);
    }

    function incrementarRemoto() external returns (uint256) {
        return contador.incrementar();
    }

    function establecerRemoto(uint256 nuevoValor) external {
        contador.establecer(nuevoValor);
    }

    function leerRemoto() external view returns (uint256) {
        return contador.valor();
    }
}

// Un contrato tambien puede crear otros contratos con `new`.
contract FabricaContadores {
    Contador[] public creados;

    event ContadorCreado(address indexed contador, address indexed creador);

    function crear() external returns (address) {
        Contador nuevo = new Contador();
        creados.push(nuevo);

        emit ContadorCreado(address(nuevo), msg.sender);
        return address(nuevo);
    }

    function totalCreados() external view returns (uint256) {
        return creados.length;
    }
}
