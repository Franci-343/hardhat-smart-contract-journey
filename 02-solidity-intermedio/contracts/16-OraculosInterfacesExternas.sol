// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Interfaz de un oraculo de precios estilo Chainlink (AggregatorV3Interface).
// Un contrato no puede consultar internet: un oraculo publica datos externos
// en la blockchain y otros contratos los leen a traves de esta interfaz.
interface IAggregatorV3 {
    function decimals() external view returns (uint8);

    function description() external view returns (string memory);

    function version() external view returns (uint256);

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

// Oraculo falso para pruebas locales: nosotros controlamos el precio y la fecha.
// En Sepolia se usa el feed real de Chainlink.
contract AggregatorMock is IAggregatorV3 {
    uint8 private immutable _decimals;
    int256 private _precio;
    uint80 private _ronda;
    uint256 private _actualizadoEn;

    constructor(uint8 decimals_, int256 precioInicial) {
        _decimals = decimals_;
        _precio = precioInicial;
        _ronda = 1;
        _actualizadoEn = block.timestamp;
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function description() external pure returns (string memory) {
        return "ETH / USD (mock)";
    }

    function version() external pure returns (uint256) {
        return 1;
    }

    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        return (_ronda, _precio, _actualizadoEn, _actualizadoEn, _ronda);
    }

    function actualizarPrecio(int256 nuevoPrecio) external {
        _precio = nuevoPrecio;
        _ronda++;
        _actualizadoEn = block.timestamp;
    }

    // Simula un oraculo que dejo de actualizarse.
    function fijarActualizadoEn(uint256 timestamp) external {
        _actualizadoEn = timestamp;
    }
}

// Consumidor: usa el oraculo y VALIDA lo que recibe. Nunca confies a ciegas en un dato externo.
contract ConsumidorPrecio {
    IAggregatorV3 public immutable feed;
    uint256 public immutable maxAntiguedad;

    // Aporte minimo de 5 USD, con 18 decimales.
    uint256 public constant MINIMO_USD = 5e18;

    mapping(address => uint256) public aportes;

    error PrecioInvalido(int256 precio);
    error PrecioObsoleto(uint256 actualizadoEn, uint256 ahora);
    error AporteInsuficiente(uint256 usdAportado, uint256 usdMinimo);

    event Aportado(address indexed quien, uint256 eth, uint256 usd);

    constructor(address feed_, uint256 maxAntiguedad_) {
        feed = IAggregatorV3(feed_);
        maxAntiguedad = maxAntiguedad_;
    }

    // Devuelve el precio de 1 ETH en USD con los decimales del feed (normalmente 8).
    function precioEth() public view returns (uint256) {
        (, int256 precio, , uint256 actualizadoEn, ) = feed.latestRoundData();

        // 1. El precio debe ser positivo.
        if (precio <= 0) revert PrecioInvalido(precio);

        // 2. El dato no puede estar viejo (oraculo caido o congelado).
        if (actualizadoEn == 0 || block.timestamp > actualizadoEn + maxAntiguedad) {
            revert PrecioObsoleto(actualizadoEn, block.timestamp);
        }

        return uint256(precio);
    }

    // Convierte wei a USD con 18 decimales.
    function ethAUsd(uint256 weiMonto) public view returns (uint256) {
        return (weiMonto * precioEth()) / (10 ** feed.decimals());
    }

    function aportar() external payable {
        uint256 usd = ethAUsd(msg.value);
        if (usd < MINIMO_USD) revert AporteInsuficiente(usd, MINIMO_USD);

        aportes[msg.sender] += msg.value;
        emit Aportado(msg.sender, msg.value, usd);
    }
}
