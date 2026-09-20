// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Modifiers avanzados: con parametros, con codigo ANTES y DESPUES de `_`,
// y apilados en un orden de ejecucion definido.
contract ModifiersAvanzados {
    address public owner;
    uint256 public llamadas;
    uint256 public constant COOLDOWN = 1 hours;

    bool private _bloqueado;

    mapping(address => uint256) public ultimaAccion;
    mapping(address => uint256) public saldos;

    error NoAutorizado(address quien);
    error ValorInsuficiente(uint256 enviado, uint256 minimo);
    error EnCooldown(uint256 segundosRestantes);
    error Reentrada();
    error EnvioFallido();
    error SinSaldo();

    event Accion(address indexed quien);
    event Retiro(address indexed quien, uint256 monto);

    constructor() {
        owner = msg.sender;
    }

    // Modifier simple.
    modifier soloOwner() {
        if (msg.sender != owner) revert NoAutorizado(msg.sender);
        _;
    }

    // Modifier con parametro: se configura al usarlo -> valorMinimo(0.01 ether).
    modifier valorMinimo(uint256 minimo) {
        if (msg.value < minimo) revert ValorInsuficiente(msg.value, minimo);
        _;
    }

    // Codigo antes de `_` (chequeo) y despues de `_` (registro de la accion).
    modifier cooldown() {
        uint256 ultima = ultimaAccion[msg.sender];
        if (ultima != 0 && block.timestamp < ultima + COOLDOWN) {
            revert EnCooldown(ultima + COOLDOWN - block.timestamp);
        }
        _;
        ultimaAccion[msg.sender] = block.timestamp;
    }

    // Solo codigo despues de `_`: se ejecuta cuando la funcion ya termino.
    modifier contarLlamada() {
        _;
        llamadas++;
    }

    // Guarda contra reentrada: bloquea mientras la funcion esta en ejecucion.
    modifier noReentrante() {
        if (_bloqueado) revert Reentrada();
        _bloqueado = true;
        _;
        _bloqueado = false;
    }

    // Los modifiers se ejecutan de izquierda a derecha: primero cooldown, luego contarLlamada.
    function accionConCooldown() external cooldown contarLlamada {
        emit Accion(msg.sender);
    }

    function depositar() external payable valorMinimo(0.01 ether) contarLlamada {
        saldos[msg.sender] += msg.value;
    }

    function retirar() external noReentrante {
        uint256 monto = saldos[msg.sender];
        if (monto == 0) revert SinSaldo();

        // Efectos antes de interacciones (checks-effects-interactions).
        saldos[msg.sender] = 0;

        (bool ok, ) = msg.sender.call{value: monto}("");
        if (!ok) revert EnvioFallido();

        emit Retiro(msg.sender, monto);
    }

    function cambiarOwner(address nuevoOwner) external soloOwner {
        owner = nuevoOwner;
    }
}

// Contrato malicioso de ejemplo: intenta volver a entrar a retirar() cuando
// recibe ETH. El modifier noReentrante lo detiene y guardamos el error.
contract AtacanteReentrada {
    ModifiersAvanzados public immutable objetivo;
    bytes4 public errorDeReentrada;

    constructor(ModifiersAvanzados objetivo_) {
        objetivo = objetivo_;
    }

    function atacar() external payable {
        objetivo.depositar{value: msg.value}();
        objetivo.retirar();
    }

    receive() external payable {
        try objetivo.retirar() {} catch (bytes memory razon) {
            errorDeReentrada = bytes4(razon);
        }
    }
}
