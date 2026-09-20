// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Contrato sobre el que haremos llamadas de bajo nivel.
contract ObjetivoBajoNivel {
    uint256 public numero;
    uint256 public recibido;

    event Establecido(address indexed por, uint256 numero, uint256 valor);

    function establecer(uint256 nuevoNumero) external payable {
        numero = nuevoNumero;
        recibido += msg.value;
        emit Establecido(msg.sender, nuevoNumero, msg.value);
    }

    function leer() external view returns (uint256) {
        return numero;
    }

    function fallar() external pure {
        revert("Falla intencional");
    }

    // Sin receive() ni fallback(): enviarle ETH "a secas" o llamar una funcion
    // inexistente hace que la llamada falle.
}

// `call` no revierte si el destino falla: devuelve (false, datos).
// Por eso SIEMPRE hay que revisar el booleano de retorno.
contract LlamadorBajoNivel {
    error LlamadaFallida(bytes datos);
    error EnvioFallido();

    event Resultado(bool exito, bytes datos);

    receive() external payable {}

    // call con firma en texto: propenso a errores de tipeo, el compilador no lo valida.
    function llamarConFirma(address objetivo, uint256 n) external payable returns (bool, bytes memory) {
        (bool ok, bytes memory datos) = objetivo.call{value: msg.value}(
            abi.encodeWithSignature("establecer(uint256)", n)
        );

        emit Resultado(ok, datos);
        return (ok, datos);
    }

    // abi.encodeCall valida nombres y tipos en compilacion: mas seguro.
    function llamarConEncodeCall(address objetivo, uint256 n) external payable returns (bytes memory) {
        (bool ok, bytes memory datos) = objetivo.call{value: msg.value}(
            abi.encodeCall(ObjetivoBajoNivel.establecer, (n))
        );

        if (!ok) revert LlamadaFallida(datos);
        return datos;
    }

    // staticcall: llamada de solo lectura. Si el destino intenta modificar estado, falla.
    function leerConStaticcall(address objetivo) external view returns (uint256) {
        (bool ok, bytes memory datos) = objetivo.staticcall(abi.encodeCall(ObjetivoBajoNivel.leer, ()));

        if (!ok) revert LlamadaFallida(datos);
        return abi.decode(datos, (uint256));
    }

    // Llamar una funcion que no existe: no hay fallback en el destino, asi que ok == false.
    function llamarInexistente(address objetivo) external returns (bool ok, bytes memory datos) {
        (ok, datos) = objetivo.call(abi.encodeWithSignature("noExiste()"));
    }

    // Llamar una funcion que hace revert: ok == false y `datos` trae el error codificado.
    function llamarQueFalla(address objetivo) external returns (bool ok, bytes memory datos) {
        (ok, datos) = objetivo.call(abi.encodeCall(ObjetivoBajoNivel.fallar, ()));
    }

    // Enviar ETH con call es la forma recomendada (transfer y send limitan el gas a 2300).
    function enviarEth(address payable destino, uint256 monto) external {
        (bool ok, ) = destino.call{value: monto}("");
        if (!ok) revert EnvioFallido();
    }

    // Selector: los primeros 4 bytes del hash keccak256 de la firma de la funcion.
    function selectorDeEstablecer() external pure returns (bytes4) {
        return bytes4(keccak256("establecer(uint256)"));
    }
}
