// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// ERC-1155 es el estandar de "multi-token": UN SOLO contrato puede manejar
// muchos tipos de token distintos, cada uno identificado por un `id`. Cada
// `id` puede comportarse como fungible (cientos de "pociones", todas
// iguales) o como no fungible (un unico "id" con supply 1, como un NFT).
//
// La gran diferencia frente a ERC-20/ERC-721 (modulo 02) es que TODO se
// mueve en lote: balances, transferencias y aprobaciones trabajan sobre
// arrays de ids y cantidades en una sola llamada.
interface IERC165Basico {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC1155Basico is IERC165Basico {
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 valor);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] valores);
    event ApprovalForAll(address indexed cuenta, address indexed operador, bool aprobado);
    event URI(string valor, uint256 indexed id);

    function balanceOf(address cuenta, uint256 id) external view returns (uint256);

    function balanceOfBatch(address[] calldata cuentas, uint256[] calldata ids) external view returns (uint256[] memory);

    function setApprovalForAll(address operador, bool aprobado) external;

    function isApprovedForAll(address cuenta, address operador) external view returns (bool);

    function safeTransferFrom(address from, address to, uint256 id, uint256 valor, bytes calldata datos) external;

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata valores,
        bytes calldata datos
    ) external;
}

// Quien reciba tokens via safeTransferFrom/safeBatchTransferFrom, si es un
// contrato, tiene que saber recibirlos (igual que ERC-721 en el modulo 02).
interface IERC1155ReceptorBasico {
    function onERC1155Received(
        address operador,
        address from,
        uint256 id,
        uint256 valor,
        bytes calldata datos
    ) external returns (bytes4);

    function onERC1155BatchReceived(
        address operador,
        address from,
        uint256[] calldata ids,
        uint256[] calldata valores,
        bytes calldata datos
    ) external returns (bytes4);
}

contract ERC1155Basico is IERC1155Basico {
    address public immutable owner;

    // id => cuenta => cuanto tiene
    mapping(uint256 => mapping(address => uint256)) private _balances;
    // cuenta => operador => tiene permiso sobre TODOS los ids?
    mapping(address => mapping(address => bool)) private _operadores;
    mapping(uint256 => string) private _uris;

    error NoEsOwner(address quien);
    error DireccionInvalida(address cuenta);
    error LongitudesNoCoinciden();
    error SaldoInsuficiente(address cuenta, uint256 id, uint256 saldo, uint256 necesario);
    error NoAutorizado(address quien);
    error ReceptorInvalido(address destino);

    modifier soloOwner() {
        if (msg.sender != owner) revert NoEsOwner(msg.sender);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ---- Lectura ----

    function balanceOf(address cuenta, uint256 id) public view returns (uint256) {
        if (cuenta == address(0)) revert DireccionInvalida(cuenta);
        return _balances[id][cuenta];
    }

    function balanceOfBatch(address[] calldata cuentas, uint256[] calldata ids)
        external
        view
        returns (uint256[] memory saldos)
    {
        if (cuentas.length != ids.length) revert LongitudesNoCoinciden();

        saldos = new uint256[](cuentas.length);

        for (uint256 i = 0; i < cuentas.length; i++) {
            saldos[i] = balanceOf(cuentas[i], ids[i]);
        }
    }

    function isApprovedForAll(address cuenta, address operador) public view returns (bool) {
        return _operadores[cuenta][operador];
    }

    function uri(uint256 id) external view returns (string memory) {
        return _uris[id];
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        // 0x01ffc9a7 = ERC-165, 0xd9b67a26 = ERC-1155.
        return interfaceId == 0x01ffc9a7 || interfaceId == 0xd9b67a26;
    }

    // ---- Aprobaciones ----

    function setApprovalForAll(address operador, bool aprobado) external {
        if (operador == address(0)) revert DireccionInvalida(operador);

        _operadores[msg.sender][operador] = aprobado;
        emit ApprovalForAll(msg.sender, operador, aprobado);
    }

    // ---- Transferencias ----

    function safeTransferFrom(address from, address to, uint256 id, uint256 valor, bytes calldata datos) external {
        _verificarAutorizado(from);
        _transferirUno(msg.sender, from, to, id, valor);
        _verificarReceptorUno(msg.sender, from, to, id, valor, datos);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata valores,
        bytes calldata datos
    ) external {
        _verificarAutorizado(from);
        if (ids.length != valores.length) revert LongitudesNoCoinciden();

        for (uint256 i = 0; i < ids.length; i++) {
            _transferirUno(msg.sender, from, to, ids[i], valores[i]);
        }

        emit TransferBatch(msg.sender, from, to, ids, valores);
        _verificarReceptorLote(msg.sender, from, to, ids, valores, datos);
    }

    // ---- Creacion ----

    function mint(address to, uint256 id, uint256 valor, string calldata uriToken) external soloOwner {
        if (to == address(0)) revert DireccionInvalida(to);

        _balances[id][to] += valor;
        if (bytes(uriToken).length > 0) {
            _uris[id] = uriToken;
            emit URI(uriToken, id);
        }

        emit TransferSingle(msg.sender, address(0), to, id, valor);
    }

    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata valores) external soloOwner {
        if (to == address(0)) revert DireccionInvalida(to);
        if (ids.length != valores.length) revert LongitudesNoCoinciden();

        for (uint256 i = 0; i < ids.length; i++) {
            _balances[ids[i]][to] += valores[i];
        }

        emit TransferBatch(msg.sender, address(0), to, ids, valores);
    }

    // ---- Internas ----

    function _verificarAutorizado(address from) internal view {
        if (msg.sender != from && !_operadores[from][msg.sender]) revert NoAutorizado(msg.sender);
    }

    function _transferirUno(address operador, address from, address to, uint256 id, uint256 valor) internal {
        if (to == address(0)) revert DireccionInvalida(to);

        uint256 saldo = _balances[id][from];
        if (saldo < valor) revert SaldoInsuficiente(from, id, saldo, valor);

        _balances[id][from] = saldo - valor;
        _balances[id][to] += valor;

        emit TransferSingle(operador, from, to, id, valor);
    }

    function _verificarReceptorUno(
        address operador,
        address from,
        address to,
        uint256 id,
        uint256 valor,
        bytes calldata datos
    ) internal {
        if (to.code.length == 0) return;

        try IERC1155ReceptorBasico(to).onERC1155Received(operador, from, id, valor, datos) returns (
            bytes4 respuesta
        ) {
            if (respuesta != IERC1155ReceptorBasico.onERC1155Received.selector) revert ReceptorInvalido(to);
        } catch {
            revert ReceptorInvalido(to);
        }
    }

    function _verificarReceptorLote(
        address operador,
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata valores,
        bytes calldata datos
    ) internal {
        if (to.code.length == 0) return;

        try IERC1155ReceptorBasico(to).onERC1155BatchReceived(operador, from, ids, valores, datos) returns (
            bytes4 respuesta
        ) {
            if (respuesta != IERC1155ReceptorBasico.onERC1155BatchReceived.selector) revert ReceptorInvalido(to);
        } catch {
            revert ReceptorInvalido(to);
        }
    }
}

// Contrato que SI sabe recibir tokens ERC-1155.
contract ReceptorERC1155 is IERC1155ReceptorBasico {
    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC1155ReceptorBasico.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        return IERC1155ReceptorBasico.onERC1155BatchReceived.selector;
    }
}

// Contrato que NO sabe recibir tokens ERC-1155: una transferencia segura
// hacia aca debe revertir, en vez de dejarlos atrapados para siempre.
contract NoReceptorERC1155 {
    uint256 public dato;
}
