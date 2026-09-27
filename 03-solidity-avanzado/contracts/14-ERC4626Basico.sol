// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Token ERC-20 minimo, para usar como "activo" subyacente de la boveda.
// Ya viste una version mas completa en el modulo 02; esta es solo lo
// necesario para esta leccion.
contract TokenSubyacente {
    string public name = "Activo de prueba";
    string public symbol = "ACT";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 suministroInicial) {
        _mint(msg.sender, suministroInicial);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 permitido = allowance[from][msg.sender];
        require(permitido >= value, "Allowance insuficiente");

        allowance[from][msg.sender] = permitido - value;
        _transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 value) external {
        _mint(to, value);
    }

    function _mint(address to, uint256 value) internal {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(balanceOf[from] >= value, "Saldo insuficiente");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
}

// ============================================================================
// ERC-4626: convierte un deposito de "activo" en "acciones" (shares) que
// representan una porcion del total depositado en la boveda. Si la boveda
// gana valor con el tiempo (intereses, comisiones, lo que sea), cada accion
// vale mas activo sin que nadie tenga que reclamar nada activamente.
// ============================================================================
//
// VULNERABLE al "ataque de inflacion del primer deposito": quien deposita
// primero, cuando totalSupply todavia es 0, puede fijar la relacion
// acciones/activo que van a usar TODOS los depositos siguientes.
contract BovedaERC4626Vulnerable {
    TokenSubyacente public immutable activo;

    string public name = "Boveda de prueba";
    string public symbol = "vACT";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);

    constructor(TokenSubyacente activo_) {
        activo = activo_;
    }

    function totalAssets() public view returns (uint256) {
        return activo.balanceOf(address(this));
    }

    // Formula estandar de ERC-4626: shares nuevas, proporcionales a lo que
    // ya existe. Sin nada depositado todavia, 1 activo = 1 accion.
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return assets;
        return (assets * supply) / totalAssets();
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return shares;
        return (shares * totalAssets()) / supply;
    }

    // Notar lo que FALTA aca: un require(shares > 0). Muchas implementaciones
    // "ingenuas" de ERC-4626 no lo tenian, y por eso un deposito de buena fe
    // puede terminar acunando CERO acciones sin que la transaccion revierta:
    // el activo entra a la boveda, pero el depositante no recibe nada a
    // cambio.
    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        shares = convertToShares(assets);

        activo.transferFrom(msg.sender, address(this), assets);

        totalSupply += shares;
        balanceOf[receiver] += shares;

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets) {
        require(msg.sender == owner, "No autorizado");

        assets = convertToAssets(shares);

        balanceOf[owner] -= shares;
        totalSupply -= shares;

        activo.transfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }
}

// ============================================================================
// CORREGIDA: "acciones muertas". El primer deposito esta obligado a ser
// grande, y una parte de esas acciones se queman (quedan en totalSupply
// pero nunca se le asignan a nadie). Eso sube el "piso" de acciones en
// circulacion desde el primer momento, y hace que donar activo directamente
// a la boveda ya no alcance para licuar a los depositantes siguientes.
// ============================================================================
contract BovedaERC4626Segura {
    TokenSubyacente public immutable activo;
    uint256 public constant ACCIONES_MUERTAS = 1_000;

    string public name = "Boveda segura de prueba";
    string public symbol = "svACT";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    bool private _semillaCreada;

    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);

    constructor(TokenSubyacente activo_) {
        activo = activo_;
    }

    function totalAssets() public view returns (uint256) {
        return activo.balanceOf(address(this));
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return assets;
        return (assets * supply) / totalAssets();
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return shares;
        return (shares * totalAssets()) / supply;
    }

    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        if (!_semillaCreada) {
            require(assets > ACCIONES_MUERTAS, "El primer deposito debe ser grande");

            _semillaCreada = true;
            totalSupply += ACCIONES_MUERTAS; // quemadas: nadie las posee
            shares = assets - ACCIONES_MUERTAS;
        } else {
            shares = convertToShares(assets);
        }

        require(shares > 0, "0 acciones");

        activo.transferFrom(msg.sender, address(this), assets);

        totalSupply += shares;
        balanceOf[receiver] += shares;

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets) {
        require(msg.sender == owner, "No autorizado");

        assets = convertToAssets(shares);

        balanceOf[owner] -= shares;
        totalSupply -= shares;

        activo.transfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }
}
