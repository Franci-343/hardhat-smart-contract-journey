// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// ============================================================================
// PARTE 1: falta un modifier.
// ============================================================================
//
// El error mas comun de control de acceso no es una tecnica sofisticada:
// es simplemente OLVIDAR proteger una funcion que deberia estar protegida.
contract CofrePremiosVulnerable {
    address public admin;
    address public ganador;
    uint256 public premio;

    constructor() payable {
        admin = msg.sender;
        premio = msg.value;
    }

    // VULNERABLE: cualquiera puede declararse ganador. Falta un
    // `require(msg.sender == admin)` o un modifier equivalente.
    function declararGanador(address nuevoGanador) external {
        ganador = nuevoGanador;
    }

    function reclamarPremio() external {
        require(msg.sender == ganador, "No eres el ganador");
        require(premio > 0, "Sin premio");

        uint256 monto = premio;
        premio = 0;

        (bool ok, ) = ganador.call{value: monto}("");
        require(ok, "Envio fallido");
    }
}

// La misma idea, con la proteccion que faltaba.
contract CofrePremiosSeguro {
    address public admin;
    address public ganador;
    uint256 public premio;

    error NoEsAdmin(address quien);

    constructor() payable {
        admin = msg.sender;
        premio = msg.value;
    }

    modifier soloAdmin() {
        if (msg.sender != admin) revert NoEsAdmin(msg.sender);
        _;
    }

    function declararGanador(address nuevoGanador) external soloAdmin {
        ganador = nuevoGanador;
    }

    function reclamarPremio() external {
        require(msg.sender == ganador, "No eres el ganador");
        require(premio > 0, "Sin premio");

        uint256 monto = premio;
        premio = 0;

        (bool ok, ) = ganador.call{value: monto}("");
        require(ok, "Envio fallido");
    }
}

// ============================================================================
// PARTE 2: autorizar con tx.origin en vez de msg.sender.
// ============================================================================
//
// A primera vista este `require` parece correcto: solo el owner puede
// retirar. El problema es QUE variable se usa para comprobarlo.
contract BancoConTxOrigin {
    address public owner;

    constructor() payable {
        owner = msg.sender;
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // VULNERABLE: tx.origin es la cuenta que FIRMO la transaccion, sin
    // importar cuantos contratos intermediarios haya en el camino.
    function retirarTodo(address payable destino) external {
        require(tx.origin == owner, "No autorizado");

        (bool ok, ) = destino.call{value: address(this).balance}("");
        require(ok, "Envio fallido");
    }
}

// Un contrato de apariencia inocente. Si el OWNER del banco firma una
// transaccion que termina llamando a este contrato (por ejemplo, porque
// cree que va a reclamar una recompensa), `retirarTodo` ve
// `tx.origin == owner` y deja pasar el retiro, aunque quien llamo
// directamente al banco fue este contrato, no el owner.
contract ContratoPhishing {
    BancoConTxOrigin public immutable banco;
    address public immutable atacante;

    constructor(BancoConTxOrigin banco_, address atacante_) {
        banco = banco_;
        atacante = atacante_;
    }

    // El nombre de la funcion es la trampa: el owner la llama esperando
    // algo bueno para el mismo.
    function reclamarRecompensa() external {
        banco.retirarTodo(payable(atacante));
    }
}

// La correccion es de una sola palabra: comprobar msg.sender.
contract BancoSeguro {
    address public owner;

    constructor() payable {
        owner = msg.sender;
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function retirarTodo(address payable destino) external {
        require(msg.sender == owner, "No autorizado");

        (bool ok, ) = destino.call{value: address(this).balance}("");
        require(ok, "Envio fallido");
    }
}

// La misma trampa, ahora contra el banco corregido.
contract ContratoPhishingContraSeguro {
    BancoSeguro public immutable banco;
    address public immutable atacante;

    constructor(BancoSeguro banco_, address atacante_) {
        banco = banco_;
        atacante = atacante_;
    }

    function reclamarRecompensa() external {
        banco.retirarTodo(payable(atacante));
    }
}
