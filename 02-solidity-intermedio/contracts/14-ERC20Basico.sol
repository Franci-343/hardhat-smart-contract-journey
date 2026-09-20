// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Interfaz del estandar ERC-20 (EIP-20).
interface IERC20Basico {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 value) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// ERC-20 escrito a mano para entender cada pieza. En proyectos reales se usa la
// implementacion auditada de OpenZeppelin (@openzeppelin/contracts).
contract ERC20Basico is IERC20Basico {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    address public immutable owner;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    error NoEsOwner(address quien);
    error DireccionInvalida(address cuenta);
    error SaldoInsuficiente(address cuenta, uint256 saldo, uint256 necesario);
    error AllowanceInsuficiente(address spender, uint256 permitido, uint256 necesario);

    modifier soloOwner() {
        if (msg.sender != owner) revert NoEsOwner(msg.sender);
        _;
    }

    // `suministroInicial` se expresa en tokens enteros; se convierte a la unidad minima.
    constructor(string memory name_, string memory symbol_, uint256 suministroInicial) {
        name = name_;
        symbol = symbol_;
        owner = msg.sender;

        _mint(msg.sender, suministroInicial * 10 ** decimals);
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address tokenOwner, address spender) external view returns (uint256) {
        return _allowances[tokenOwner][spender];
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 permitido = _allowances[from][msg.sender];

        // Convencion: un allowance "infinito" (max uint256) no se descuenta.
        if (permitido != type(uint256).max) {
            if (permitido < value) revert AllowanceInsuficiente(msg.sender, permitido, value);
            _allowances[from][msg.sender] = permitido - value;
        }

        _transfer(from, to, value);
        return true;
    }

    // Solo el owner puede crear tokens nuevos.
    function mint(address to, uint256 value) external soloOwner {
        _mint(to, value);
    }

    // Cualquiera puede quemar sus propios tokens.
    function burn(uint256 value) external {
        uint256 saldo = _balances[msg.sender];
        if (saldo < value) revert SaldoInsuficiente(msg.sender, saldo, value);

        _balances[msg.sender] = saldo - value;
        _totalSupply -= value;

        emit Transfer(msg.sender, address(0), value);
    }

    function _transfer(address from, address to, uint256 value) internal {
        if (to == address(0)) revert DireccionInvalida(to);

        uint256 saldo = _balances[from];
        if (saldo < value) revert SaldoInsuficiente(from, saldo, value);

        _balances[from] = saldo - value;
        _balances[to] += value;

        emit Transfer(from, to, value);
    }

    function _approve(address tokenOwner, address spender, uint256 value) internal {
        if (spender == address(0)) revert DireccionInvalida(spender);

        _allowances[tokenOwner][spender] = value;
        emit Approval(tokenOwner, spender, value);
    }

    function _mint(address to, uint256 value) internal {
        if (to == address(0)) revert DireccionInvalida(to);

        _totalSupply += value;
        _balances[to] += value;

        emit Transfer(address(0), to, value);
    }
}
