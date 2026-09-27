// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// `delegatecall` ejecuta el CODIGO de otro contrato, pero usando el
// STORAGE, el `msg.sender` y el `msg.value` de quien hace la llamada. Es la
// base de las librerias con funciones externas y de los proxies
// actualizables (lecciones 10 y 11). Tambien es una de las formas mas
// faciles de romper un contrato por accidente.
contract LogicaContador {
    uint256 public contador; // slot 0

    function incrementar() external {
        contador += 1;
    }

    function fijar(uint256 valor) external {
        contador = valor;
    }

    // delegatecall NO cambia msg.sender ni msg.value: siguen siendo los de
    // quien llamo al contrato que hizo el delegatecall (el "proxy"), no
    // esta direccion (LogicaContador).
    function quienMeLlama() external view returns (address) {
        return msg.sender;
    }
}

// ============================================================================
// VULNERABLE: orden de variables distinto al de LogicaContador.
// ============================================================================
//
// Cuando LogicaContador.incrementar() se ejecuta via delegatecall desde
// aca, su instruccion "contador += 1" escribe en EL SLOT 0 de quien hizo la
// llamada (osea, de este contrato) porque para Logica, `contador` es la
// variable del slot 0. Pero en ProxyMalo, el slot 0 es `owner`, no
// `contador`. El delegatecall corrompe `owner` sin tocar el `contador` real.
contract ProxyMalo {
    address public owner; // slot 0 (!)
    uint256 public contador; // slot 1

    constructor() {
        owner = msg.sender;
    }

    function incrementar(address logica) external {
        (bool ok, ) = logica.delegatecall(abi.encodeWithSignature("incrementar()"));
        require(ok, "delegatecall fallo");
    }
}

// ============================================================================
// CORREGIDO: mismo orden y mismos tipos que LogicaContador, al menos para
// las variables compartidas. Cualquier variable propia del proxy va DESPUES.
// ============================================================================
contract ProxyBueno {
    uint256 public contador; // slot 0, igual que en LogicaContador
    address public owner; // slot 1, despues de lo que Logica usa

    constructor() {
        owner = msg.sender;
    }

    function incrementar(address logica) external {
        (bool ok, ) = logica.delegatecall(abi.encodeWithSignature("incrementar()"));
        require(ok, "delegatecall fallo");
    }

    function fijar(address logica, uint256 valor) external {
        (bool ok, ) = logica.delegatecall(abi.encodeWithSignature("fijar(uint256)", valor));
        require(ok, "delegatecall fallo");
    }

    // Delega la pregunta "quien te llamo" y devuelve la respuesta, para
    // demostrar que msg.sender viaja intacto a traves del delegatecall.
    function preguntarQuienLlama(address logica) external returns (address resultado) {
        (bool ok, bytes memory datos) = logica.delegatecall(abi.encodeWithSignature("quienMeLlama()"));
        require(ok, "delegatecall fallo");
        resultado = abi.decode(datos, (address));
    }
}
