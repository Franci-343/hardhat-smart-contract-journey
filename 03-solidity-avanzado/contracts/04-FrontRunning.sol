// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// ============================================================================
// VULNERABLE: el ganador es quien llega PRIMERO con la respuesta correcta.
// ============================================================================
//
// El problema no esta en la logica del contrato: es en QUE MOMENTO se hace
// publica la respuesta. Antes de ser minada, una transaccion pendiente es
// visible para cualquiera que mire el mempool. Un bot puede copiar
// `respuesta` de la transaccion de otra persona, pagar mas gas, y que la
// SUYA se mine primero.
contract AcertijoFrontRunnable {
    bytes32 public immutable hashRespuesta;
    address public ganador;
    uint256 public premio;

    constructor(bytes32 hashRespuesta_) payable {
        hashRespuesta = hashRespuesta_;
        premio = msg.value;
    }

    function resolver(string calldata respuesta) external {
        require(ganador == address(0), "Ya resuelto");
        require(keccak256(abi.encodePacked(respuesta)) == hashRespuesta, "Respuesta incorrecta");

        ganador = msg.sender;

        uint256 monto = premio;
        premio = 0;

        (bool ok, ) = msg.sender.call{value: monto}("");
        require(ok, "Envio fallido");
    }
}

// ============================================================================
// CORREGIDO: commit-reveal, atando el compromiso a quien lo hizo.
// ============================================================================
//
// Fase 1 (comprometer): cada quien envia solo un HASH de su respuesta mas un
// secreto aleatorio. El hash no revela nada: no hay nada que copiar todavia.
//
// Fase 2 (revelar): cada quien publica su respuesta y su secreto en texto
// plano. Aca es donde alguien podria intentar copiar... pero el hash que se
// comprometio incluye `msg.sender`. Si un atacante copia (respuesta, secreto)
// y los revela desde SU PROPIA direccion, el hash resultante no coincide con
// lo que el comprometio (el nunca comprometio ese hash), y la transaccion
// revierte.
contract AcertijoCommitReveal {
    bytes32 public immutable hashRespuesta;
    uint256 public premio;
    address public ganador;

    mapping(address => bytes32) public compromisos;

    constructor(bytes32 hashRespuesta_) payable {
        hashRespuesta = hashRespuesta_;
        premio = msg.value;
    }

    // hashCompromiso = keccak256(abi.encodePacked(respuesta, secreto, msg.sender))
    // calculado FUERA de la cadena, antes de llamar a esta funcion.
    function comprometer(bytes32 hashCompromiso) external {
        compromisos[msg.sender] = hashCompromiso;
    }

    function revelar(string calldata respuesta, bytes32 secreto) external {
        require(ganador == address(0), "Ya resuelto");
        require(
            keccak256(abi.encodePacked(respuesta, secreto, msg.sender)) == compromisos[msg.sender],
            "No coincide con tu compromiso"
        );
        require(keccak256(abi.encodePacked(respuesta)) == hashRespuesta, "Respuesta incorrecta");

        ganador = msg.sender;

        uint256 monto = premio;
        premio = 0;

        (bool ok, ) = msg.sender.call{value: monto}("");
        require(ok, "Envio fallido");
    }
}
