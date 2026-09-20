// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Control de acceso basado en roles (RBAC). Es la misma idea de AccessControl de
// OpenZeppelin, escrita a mano y simplificada para entender como funciona por dentro.
contract ControlDeAcceso {
    // Un rol es solo un identificador de 32 bytes: el hash de su nombre.
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    // rol => cuenta => tiene el rol?
    mapping(bytes32 => mapping(address => bool)) private _roles;

    uint256 public totalEmitido;
    string public mensaje;

    error SinRol(bytes32 rol, address cuenta);

    event RolOtorgado(bytes32 indexed rol, address indexed cuenta, address indexed por);
    event RolRevocado(bytes32 indexed rol, address indexed cuenta, address indexed por);

    modifier soloRol(bytes32 rol) {
        if (!_roles[rol][msg.sender]) revert SinRol(rol, msg.sender);
        _;
    }

    constructor() {
        _otorgar(ADMIN_ROLE, msg.sender);
    }

    function tieneRol(bytes32 rol, address cuenta) public view returns (bool) {
        return _roles[rol][cuenta];
    }

    // Solo un admin puede repartir o quitar roles.
    function otorgarRol(bytes32 rol, address cuenta) external soloRol(ADMIN_ROLE) {
        _otorgar(rol, cuenta);
    }

    function revocarRol(bytes32 rol, address cuenta) external soloRol(ADMIN_ROLE) {
        if (_roles[rol][cuenta]) {
            _roles[rol][cuenta] = false;
            emit RolRevocado(rol, cuenta, msg.sender);
        }
    }

    // Cada cuenta puede renunciar a sus propios roles sin pedir permiso.
    function renunciarRol(bytes32 rol) external {
        if (_roles[rol][msg.sender]) {
            _roles[rol][msg.sender] = false;
            emit RolRevocado(rol, msg.sender, msg.sender);
        }
    }

    // Funciones protegidas por roles distintos.
    function emitir(uint256 cantidad) external soloRol(MINTER_ROLE) {
        totalEmitido += cantidad;
    }

    function cambiarMensaje(string calldata nuevoMensaje) external soloRol(EDITOR_ROLE) {
        mensaje = nuevoMensaje;
    }

    function _otorgar(bytes32 rol, address cuenta) internal {
        if (!_roles[rol][cuenta]) {
            _roles[rol][cuenta] = true;
            emit RolOtorgado(rol, cuenta, msg.sender);
        }
    }
}
