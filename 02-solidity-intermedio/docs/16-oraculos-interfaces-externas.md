# 16 - Oraculos e interfaces externas

Un contrato inteligente vive aislado: **no puede consultar internet**. No sabe cuanto cuesta un ETH en dolares, ni si llovio ayer, ni el resultado de un partido. Todo lo que necesite saber del mundo exterior tiene que **estar ya escrito en la blockchain**.

Un **oraculo** es el puente: alguien publica datos externos en la cadena, y los contratos los leen.

Archivos de esta leccion:

- `contracts/16-OraculosInterfacesExternas.sol`
- `test/16-OraculosInterfacesExternas.ts`
- `ignition/modules/16-OraculosInterfacesExternas.ts`
- `scripts/deploy-OraculosInterfacesExternas.ts`

## Chainlink Data Feeds

El oraculo mas usado para precios es **Chainlink**. Una red de nodos independientes consulta varias fuentes, calcula un valor agregado y lo publica en un contrato "feed" (por ejemplo, ETH/USD). Tu contrato solo lee ese feed.

La interfaz que expone (`AggregatorV3Interface`) es la que copiamos como `IAggregatorV3`:

```solidity
interface IAggregatorV3 {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);

    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,        // el precio
        uint256 startedAt,
        uint256 updatedAt,    // cuando se actualizo por ultima vez
        uint80 answeredInRound
    );
}
```

Esta es la leccion de **interfaces externas** aplicada: no importas el codigo de Chainlink, solo declaras la interfaz que necesitas (leccion 04) y llamas al contrato por su direccion (leccion 09).

## Los decimales del precio

Los feeds de precios en USD normalmente usan **8 decimales**:

```text
answer = 200000000000   ->  2000.00000000 USD
```

Pide siempre `decimals()` en lugar de suponerlos. Para convertir ETH a USD con 18 decimales:

```solidity
function ethAUsd(uint256 weiMonto) public view returns (uint256) {
    return (weiMonto * precioEth()) / (10 ** feed.decimals());
}
```

Con `1 ether` (1e18 wei) y precio `2000e8`:

```text
1e18 * 2000e8 / 1e8 = 2000e18   ->  2000 USD con 18 decimales
```

## Validar SIEMPRE el dato

Un oraculo es una **dependencia externa**. Si falla o esta comprometido, tu contrato lo hereda. Nunca uses `latestRoundData()` sin comprobar:

```solidity
(, int256 precio, , uint256 actualizadoEn, ) = feed.latestRoundData();

// 1. El precio debe ser positivo.
if (precio <= 0) revert PrecioInvalido(precio);

// 2. El dato no puede estar viejo.
if (actualizadoEn == 0 || block.timestamp > actualizadoEn + maxAntiguedad) {
    revert PrecioObsoleto(actualizadoEn, block.timestamp);
}
```

- **Precio invalido**: `answer` es `int256`, asi que puede venir `0` o negativo por un fallo. Convertirlo a `uint256` sin comprobar produciria un numero gigantesco.
- **Precio obsoleto (stale)**: si el oraculo se cae, `latestRoundData()` sigue devolviendo el **ultimo** valor, sin avisar. Compara `updatedAt` con el tiempo actual. Cada feed publica su "heartbeat" (por ejemplo, cada hora): usa un margen coherente con el.

Ambos casos estan en el test.

## El oraculo falso (mock)

En local no hay un feed de Chainlink, asi que `AggregatorMock` implementa la misma interfaz y nosotros controlamos el precio y la fecha:

```solidity
function actualizarPrecio(int256 nuevoPrecio) external { ... }
function fijarActualizadoEn(uint256 timestamp) external { ... }
```

El **mock** es una tecnica de pruebas: sustituir un componente externo por uno controlado. Gracias a la interfaz, `ConsumidorPrecio` no nota la diferencia entre el mock y el feed real.

En el test se simula un oraculo caido avanzando el tiempo de la red:

```ts
await networkHelpers.time.increase(7200);   // pasan 2 horas sin actualizacion
await viem.assertions.revertWithCustomError(consumidor.read.precioEth(), consumidor, "PrecioObsoleto");
```

## Ejemplo: aporte minimo en dolares

```solidity
uint256 public constant MINIMO_USD = 5e18;

function aportar() external payable {
    uint256 usd = ethAUsd(msg.value);
    if (usd < MINIMO_USD) revert AporteInsuficiente(usd, MINIMO_USD);
    aportes[msg.sender] += msg.value;
}
```

El contrato acepta un aporte solo si vale al menos 5 USD **al precio actual**. A 2000 USD/ETH, `0.001 ETH` = 2 USD se rechaza y `0.01 ETH` = 20 USD se acepta. Es una version del patron de crowdfunding donde el minimo se expresa en moneda estable en lugar de en ETH.

## Usar el feed real en Sepolia

Chainlink publica feeds en las testnets. En Sepolia, el feed ETH/USD esta en una direccion fija:

```text
0x694AA1769357215DE4FAC081bf1f309aDC325306
```

**Verifica la direccion en la documentacion oficial de Chainlink** (Data Feeds > Price Feeds > Sepolia) antes de usarla. Las direcciones son datos externos y pueden cambiar.

El script `scripts/deploy-OraculosInterfacesExternas.ts` detecta la red:

- En local (`chainId 31337`): despliega `AggregatorMock`.
- En Sepolia (`chainId 11155111`): usa el feed real.

```bash
# local: usa el mock
npx hardhat run scripts/deploy-OraculosInterfacesExternas.ts --network hardhatMainnet

# Sepolia: usa el feed de Chainlink
npx hardhat run scripts/deploy-OraculosInterfacesExternas.ts --network sepolia
```

El modulo de Ignition (`ignition/modules/16-...`) siempre despliega el mock, pensado para local.

## Riesgos de los oraculos

| Riesgo | Descripcion | Defensa |
| --- | --- | --- |
| Dato obsoleto | El oraculo dejo de actualizarse | Comparar `updatedAt` |
| Dato invalido | Precio `0` o negativo | Validar `answer > 0` |
| Manipulacion de precio | Leer el precio "spot" de un solo exchange que un atacante puede mover con un prestamo flash | Usar oraculos descentralizados o TWAP, no un unico pool |
| Punto unico de fallo | Depender de un oraculo controlado por una sola entidad | Feeds descentralizados, varios oraculos |
| Feed equivocado | La direccion apunta a otro par o a otra red | Verificar `description()` y la direccion en la documentacion oficial |

Muchos exploits de DeFi no rompen el contrato: manipulan lo que el contrato **cree** que es el precio.

Aprovecha `description()` para confirmar que estas leyendo el par que crees ("ETH / USD").

## Interfaces externas en general

Lo que aprendiste con Chainlink aplica a cualquier protocolo:

1. Busca su **interfaz** (o escribe solo las funciones que necesitas).
2. Guarda la **direccion** del contrato (validandola, porque cambia por red).
3. **Valida** lo que te devuelve. Nunca confies ciegamente.
4. **Prueba con mocks** en local y con el contrato real en testnet.

## Ejecutar el test

```bash
npx hardhat test test/16-OraculosInterfacesExternas.ts
```

## Errores comunes

### Ignorar `decimals()`

Un precio con 8 decimales tratado como 18 da un valor 10 mil millones de veces menor.

### No validar la antiguedad

El contrato usa un precio de hace dias sin darse cuenta.

### Direccion de feed de otra red

Cada red tiene sus propias direcciones. La de mainnet no existe en Sepolia.

### Llamar a `latestRoundData` desde una funcion `pure`

Lee estado externo: debe ser `view`.

## Ejercicios

1. Agrega un `revert` si el precio cambio mas de un 20% respecto a la lectura anterior.
2. Cambia `precioEth()` para que use un precio de respaldo (`try/catch`, leccion 11) cuando el oraculo principal falle.
3. Agrega una funcion `usdAEth(uint256 usd)` que haga la conversion inversa.

## Resumen

- Los contratos no acceden a internet; los oraculos publican datos externos en la cadena.
- Se lee un feed con una **interfaz** y la direccion del contrato.
- Siempre valida: precio positivo, dato reciente, decimales correctos.
- Usa un mock en local y el feed real en Sepolia.
- La mayoria de los ataques a oraculos manipulan el precio que el contrato considera valido.
