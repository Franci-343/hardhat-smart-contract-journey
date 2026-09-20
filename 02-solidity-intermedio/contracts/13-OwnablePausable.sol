// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Propietario unico con transferencia en DOS pasos: el dueno actual propone y el
// nuevo dueno debe aceptar. Evita perder el contrato por escribir mal una direccion.
abstract contract Propietario {
    address public owner;
    address public pendingOwner;

    error NoEsPropietario(address quien);
    error NoEsPendiente(address quien);

    event PropiedadPropuesta(address indexed actual, address indexed propuesto);
    event PropiedadTransferida(address indexed anterior, address indexed nuevo);

    constructor() {
        owner = msg.sender;
        emit PropiedadTransferida(address(0), msg.sender);
    }

    modifier soloPropietario() {
        if (msg.sender != owner) revert NoEsPropietario(msg.sender);
        _;
    }

    function proponerPropietario(address nuevo) external soloPropietario {
        pendingOwner = nuevo;
        emit PropiedadPropuesta(owner, nuevo);
    }

    function aceptarPropiedad() external {
        if (msg.sender != pendingOwner) revert NoEsPendiente(msg.sender);

        address anterior = owner;
        owner = msg.sender;
        pendingOwner = address(0);

        emit PropiedadTransferida(anterior, msg.sender);
    }

    // Deja el contrato sin dueno: las funciones soloPropietario quedan bloqueadas para siempre.
    function renunciarPropiedad() external soloPropietario {
        emit PropiedadTransferida(owner, address(0));
        owner = address(0);
        pendingOwner = address(0);
    }
}

// Interruptor de emergencia: permite frenar las funciones sensibles.
abstract contract PausableBasico {
    bool public paused;

    error ContratoPausado();
    error ContratoNoPausado();

    event Pausado(address indexed por);
    event Reanudado(address indexed por);

    modifier cuandoNoPausado() {
        if (paused) revert ContratoPausado();
        _;
    }

    modifier cuandoPausado() {
        if (!paused) revert ContratoNoPausado();
        _;
    }

    function _pausar() internal cuandoNoPausado {
        paused = true;
        emit Pausado(msg.sender);
    }

    function _reanudar() internal cuandoPausado {
        paused = false;
        emit Reanudado(msg.sender);
    }
}

// Boveda que combina ambos patrones.
contract BovedaSegura is Propietario, PausableBasico {
    mapping(address => uint256) public saldos;

    error SinSaldo();
    error EnvioFallido();

    event Depositado(address indexed quien, uint256 monto);
    event Retirado(address indexed quien, uint256 monto);
    event RetiroDeEmergencia(address indexed destino, uint256 monto);

    function depositar() external payable cuandoNoPausado {
        saldos[msg.sender] += msg.value;
        emit Depositado(msg.sender, msg.value);
    }

    function retirar() external cuandoNoPausado {
        uint256 monto = saldos[msg.sender];
        if (monto == 0) revert SinSaldo();

        saldos[msg.sender] = 0;

        (bool ok, ) = msg.sender.call{value: monto}("");
        if (!ok) revert EnvioFallido();

        emit Retirado(msg.sender, monto);
    }

    function pausar() external soloPropietario {
        _pausar();
    }

    function reanudar() external soloPropietario {
        _reanudar();
    }

    // Solo con el contrato pausado. Da mucho poder al owner: en un producto real se
    // limitaria (multisig, timelock) o se dejaria que cada usuario retire lo suyo.
    function retiroDeEmergencia(address payable destino) external soloPropietario cuandoPausado {
        uint256 monto = address(this).balance;

        (bool ok, ) = destino.call{value: monto}("");
        if (!ok) revert EnvioFallido();

        emit RetiroDeEmergencia(destino, monto);
    }
}
