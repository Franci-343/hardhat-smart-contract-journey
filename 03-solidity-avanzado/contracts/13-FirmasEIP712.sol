// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// EIP-712 define como firmar DATOS ESTRUCTURADOS (no solo texto plano) de
// forma que la wallet del usuario pueda MOSTRAR los campos exactos que esta
// firmando ("Autorizo mover 100 TOK a Bob antes del bloque X"), en vez de
// un blob de bytes ilegible. El contrato despues verifica esa firma con
// `ecrecover` y actua en nombre del firmante, SIN que el firmante haya
// pagado gas ni enviado una transaccion (patron de "meta-transacciones").
contract FirmasEIP712 {
    // ---- Dominio: ata la firma a ESTE contrato, en ESTA red ----
    bytes32 private constant _TYPE_HASH_DOMINIO =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    // ---- Tipo del mensaje que se puede firmar ----
    // "Autorizo enviar `monto` a `destino`, con este `nonce`, antes de `plazo`."
    bytes32 private constant _TYPE_HASH_AUTORIZACION =
        keccak256("Autorizacion(address destino,uint256 monto,uint256 nonce,uint256 plazo)");

    bytes32 private immutable _DOMAIN_SEPARATOR;

    mapping(address => uint256) public nonces;
    mapping(address => uint256) public saldos;

    error FirmaInvalida();
    error FirmaExpirada(uint256 plazo, uint256 ahora);
    error NonceIncorrecto(uint256 esperado, uint256 recibido);

    event Ejecutada(address indexed firmante, address indexed destino, uint256 monto, uint256 nonce);

    constructor() {
        _DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                _TYPE_HASH_DOMINIO,
                keccak256(bytes("Curso Solidity Avanzado")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function domainSeparator() external view returns (bytes32) {
        return _DOMAIN_SEPARATOR;
    }

    function depositar() external payable {
        saldos[msg.sender] += msg.value;
    }

    // El hash que la wallet del usuario firma NO es sobre estos bytes
    // "a secas": envuelve el hash del mensaje con el dominio, siguiendo el
    // prefijo "\x19\x01" que exige EIP-712.
    function hashParaFirmar(address destino, uint256 monto, uint256 nonce, uint256 plazo)
        public
        view
        returns (bytes32)
    {
        bytes32 hashMensaje = keccak256(abi.encode(_TYPE_HASH_AUTORIZACION, destino, monto, nonce, plazo));

        return keccak256(abi.encodePacked("\x19\x01", _DOMAIN_SEPARATOR, hashMensaje));
    }

    // Cualquiera puede llamar a esta funcion (por ejemplo, un relayer que
    // paga el gas), pero el dinero SIEMPRE sale de la cuenta que firmo,
    // nunca de msg.sender.
    function ejecutarConFirma(
        address firmante,
        address destino,
        uint256 monto,
        uint256 nonce,
        uint256 plazo,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (block.timestamp > plazo) revert FirmaExpirada(plazo, block.timestamp);
        if (nonce != nonces[firmante]) revert NonceIncorrecto(nonces[firmante], nonce);

        bytes32 hash = hashParaFirmar(destino, monto, nonce, plazo);
        address recuperado = ecrecover(hash, v, r, s);

        if (recuperado == address(0) || recuperado != firmante) revert FirmaInvalida();

        nonces[firmante]++;

        require(saldos[firmante] >= monto, "Saldo insuficiente");
        saldos[firmante] -= monto;
        saldos[destino] += monto;

        emit Ejecutada(firmante, destino, monto, nonce);
    }
}
