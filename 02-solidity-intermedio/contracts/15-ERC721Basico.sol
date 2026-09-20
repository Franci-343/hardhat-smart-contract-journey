// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// ERC-165: permite preguntar a un contrato "soportas esta interfaz?".
interface IERC165Basico {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// Interfaz del estandar ERC-721 (NFTs).
interface IERC721Basico is IERC165Basico {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256);

    function ownerOf(uint256 tokenId) external view returns (address);

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    function transferFrom(address from, address to, uint256 tokenId) external;

    function approve(address to, uint256 tokenId) external;

    function setApprovalForAll(address operator, bool approved) external;

    function getApproved(uint256 tokenId) external view returns (address);

    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

// Un contrato que quiera recibir NFTs con safeTransferFrom debe implementar esto.
interface IERC721ReceptorBasico {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

// ERC-721 escrito a mano. En proyectos reales se usa OpenZeppelin.
contract ERC721Basico is IERC721Basico {
    string public name;
    string public symbol;
    address public immutable owner;

    uint256 private _siguienteId;

    mapping(uint256 => address) private _duenos;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _aprobados;
    mapping(address => mapping(address => bool)) private _operadores;
    mapping(uint256 => string) private _uris;

    error NoEsOwner(address quien);
    error TokenInexistente(uint256 tokenId);
    error DireccionInvalida(address cuenta);
    error DuenoIncorrecto(address esperado, address real);
    error NoAutorizado(address quien, uint256 tokenId);
    error ReceptorInvalido(address destino);

    modifier soloOwner() {
        if (msg.sender != owner) revert NoEsOwner(msg.sender);
        _;
    }

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
        owner = msg.sender;
    }

    // ---- Lectura ----

    function balanceOf(address cuenta) external view returns (uint256) {
        if (cuenta == address(0)) revert DireccionInvalida(cuenta);
        return _balances[cuenta];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address dueno = _duenos[tokenId];
        if (dueno == address(0)) revert TokenInexistente(tokenId);
        return dueno;
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        ownerOf(tokenId); // revierte si no existe
        return _aprobados[tokenId];
    }

    function isApprovedForAll(address tokenOwner, address operador) public view returns (bool) {
        return _operadores[tokenOwner][operador];
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        ownerOf(tokenId);
        return _uris[tokenId];
    }

    function totalMinteados() external view returns (uint256) {
        return _siguienteId;
    }

    // ERC-165: 0x01ffc9a7 = ERC-165, 0x80ac58cd = ERC-721, 0x5b5e139f = ERC-721 Metadata.
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd || interfaceId == 0x5b5e139f;
    }

    // ---- Aprobaciones ----

    function approve(address to, uint256 tokenId) external {
        address dueno = ownerOf(tokenId);
        if (msg.sender != dueno && !_operadores[dueno][msg.sender]) revert NoAutorizado(msg.sender, tokenId);

        _aprobados[tokenId] = to;
        emit Approval(dueno, to, tokenId);
    }

    function setApprovalForAll(address operador, bool aprobado) external {
        if (operador == address(0)) revert DireccionInvalida(operador);

        _operadores[msg.sender][operador] = aprobado;
        emit ApprovalForAll(msg.sender, operador, aprobado);
    }

    // ---- Transferencias ----

    function transferFrom(address from, address to, uint256 tokenId) public {
        address dueno = ownerOf(tokenId);
        bool autorizado = msg.sender == dueno ||
            _aprobados[tokenId] == msg.sender ||
            _operadores[dueno][msg.sender];
        if (!autorizado) revert NoAutorizado(msg.sender, tokenId);

        _transferir(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
        _verificarReceptor(from, to, tokenId, data);
    }

    // ---- Creacion y destruccion ----

    function mint(address to, string calldata uri) external soloOwner returns (uint256) {
        return _mint(to, uri);
    }

    // Igual que mint, pero si `to` es un contrato exige que sepa recibir NFTs.
    function safeMint(address to, string calldata uri) external soloOwner returns (uint256) {
        uint256 tokenId = _mint(to, uri);
        _verificarReceptor(address(0), to, tokenId, "");
        return tokenId;
    }

    function burn(uint256 tokenId) external {
        address dueno = ownerOf(tokenId);
        bool autorizado = msg.sender == dueno ||
            _aprobados[tokenId] == msg.sender ||
            _operadores[dueno][msg.sender];
        if (!autorizado) revert NoAutorizado(msg.sender, tokenId);

        delete _aprobados[tokenId];
        delete _duenos[tokenId];
        delete _uris[tokenId];
        _balances[dueno] -= 1;

        emit Transfer(dueno, address(0), tokenId);
    }

    // ---- Internas ----

    function _mint(address to, string calldata uri) internal returns (uint256 tokenId) {
        if (to == address(0)) revert DireccionInvalida(to);

        tokenId = _siguienteId++;
        _duenos[tokenId] = to;
        _uris[tokenId] = uri;
        _balances[to] += 1;

        emit Transfer(address(0), to, tokenId);
    }

    function _transferir(address from, address to, uint256 tokenId) internal {
        address dueno = ownerOf(tokenId);
        if (dueno != from) revert DuenoIncorrecto(from, dueno);
        if (to == address(0)) revert DireccionInvalida(to);

        delete _aprobados[tokenId]; // la aprobacion individual se borra al transferir
        _balances[from] -= 1;
        _balances[to] += 1;
        _duenos[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _verificarReceptor(address from, address to, uint256 tokenId, bytes memory data) internal {
        if (to.code.length == 0) return; // una cuenta normal siempre puede recibir

        try IERC721ReceptorBasico(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 respuesta) {
            if (respuesta != IERC721ReceptorBasico.onERC721Received.selector) revert ReceptorInvalido(to);
        } catch {
            revert ReceptorInvalido(to);
        }
    }
}

// Contrato que SI sabe recibir NFTs.
contract ReceptorNFT is IERC721ReceptorBasico {
    address public ultimoRemitente;
    uint256 public ultimoTokenId;

    function onERC721Received(address, address from, uint256 tokenId, bytes calldata) external returns (bytes4) {
        ultimoRemitente = from;
        ultimoTokenId = tokenId;
        return IERC721ReceptorBasico.onERC721Received.selector;
    }
}

// Contrato que NO sabe recibir NFTs: un safeTransferFrom hacia aqui revierte
// y evita que el NFT quede atrapado para siempre.
contract NoReceptorNFT {
    uint256 public dato;
}
