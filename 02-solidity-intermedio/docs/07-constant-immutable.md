# 07 - `constant` e `immutable`

Algunas variables **nunca cambian** despues de definirse. Solidity permite marcarlas para que el compilador las trate de forma especial y ahorre gas.

Archivos de esta leccion:

- `contracts/07-ConstantImmutable.sol`
- `test/07-ConstantImmutable.ts`
- `ignition/modules/07-ConstantImmutable.ts`
- `scripts/deploy-ConstantImmutable.ts`

## Los tres tipos de variables de estado

| | `constant` | `immutable` | Normal |
| --- | --- | --- | --- |
| Cuando se fija el valor | Al **compilar** | Una vez, en el **constructor** | Cuando quieras |
| Puede cambiar despues | No | No | Si |
| Donde vive | Dentro del bytecode | Dentro del bytecode | En **storage** |
| Coste de lectura | Casi cero | Casi cero | Un SLOAD (2100 gas la primera vez) |

```solidity
uint256 public constant MAX_SUPPLY = 1_000_000;    // conocido al compilar
address public immutable OWNER;                     // se fija al desplegar
uint256 public feeEnStorage;                        // variable normal
```

## `constant`

El valor debe conocerse al compilar: numeros, strings, expresiones con literales, `keccak256("texto")`.

```solidity
uint256 public constant MAX_SUPPLY = 1_000_000;
string public constant NOMBRE = "Curso Intermedio";
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
```

El compilador **reemplaza cada uso** por el valor literal. No se reserva ningun slot de storage.

No puedes hacer esto con `constant`:

```solidity
uint256 public constant AHORA = block.timestamp;   // error: no se conoce al compilar
```

## `immutable`

El valor se decide en el **constructor** y queda fijo para siempre:

```solidity
address public immutable OWNER;
uint256 public immutable CREADO_EN;
uint256 public immutable FEE_BPS;

constructor(uint256 feeBps) {
    OWNER = msg.sender;
    CREADO_EN = block.timestamp;
    FEE_BPS = feeBps;
}
```

Reglas:

- Solo se puede asignar **en el constructor** (o en la declaracion).
- Al terminar el constructor, el valor se "graba" en el bytecode del contrato desplegado.
- Solo admite **tipos de valor**: numeros, `bool`, `address`, `bytes32`, contratos... No admite `string`, `bytes`, arrays ni structs (`Immutable variables cannot have a non-value type`). Para textos fijos usa `constant`.
- Desde Solidity 0.8.21 se puede asignar dentro de un `if` y leer despues de asignar, pero mantener la asignacion simple y directa hace el codigo mas facil de auditar.

Casos de uso tipicos:

- El dueno inicial.
- La direccion de otro contrato con el que se habla (`IContador public immutable contador`, lo viste en la leccion 09).
- Parametros de configuracion que no deben cambiar (fees, limites, decimales).

## Convencion de nombres

Las constantes e inmutables se escriben en `MAYUSCULAS_CON_GUION_BAJO`. Asi, al leer el codigo, sabes de un vistazo que no son variables de storage normales.

## Cuanto ahorras

El contrato tiene dos funciones equivalentes:

```solidity
function calcularFeeConImmutable(uint256 monto) external view returns (uint256) {
    return (monto * FEE_BPS) / 10_000;      // lee del bytecode
}

function calcularFeeConStorage(uint256 monto) external view returns (uint256) {
    return (monto * feeEnStorage) / 10_000; // lee de storage (SLOAD)
}
```

El test mide el gas de ambas con `estimateGas` y comprueba que la version `immutable` cuesta menos. Con una sola lectura la diferencia es pequena, pero **se acumula**: las lecturas de storage cuestan 2100 gas en frio, y las de `immutable` alrededor de 3.

Tambien se ahorra al **desplegar**: no hay que escribir un slot de storage (20 000 gas por slot nuevo).

## Cuando NO usar `immutable`

Si el valor necesita poder cambiar (por ejemplo, un fee que el owner ajusta), tiene que ser una variable normal. `immutable` es para lo que se decide una vez y no se toca.

Un caso especial: los **contratos actualizables (proxies)** no pueden usar `immutable` para su estado propio, porque el estado vive en el proxy. Lo veras en el modulo 03.

## Validar en el constructor

```solidity
constructor(uint256 feeBps) {
    if (feeBps > 10_000) revert FeeInvalido(feeBps);
    ...
}
```

Como el valor no se podra cambiar, valida **antes** de fijarlo. Un fee mal puesto en un `immutable` obliga a redesplegar el contrato. El test comprueba que un fee de `10001` (100.01%) rechaza el despliegue.

## Ejecutar el test

```bash
npx hardhat test test/07-ConstantImmutable.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ConstantImmutable.ts --network hardhatMainnet
npx hardhat ignition deploy ignition/modules/07-ConstantImmutable.ts --network hardhatMainnet
```

Con Ignition, el `feeBps` viene de `m.getParameter("feeBps", 250n)` y se puede cambiar por parametros.

## Errores comunes

### `Immutable variables cannot have a non-value type`

Intentas usar `immutable` con un `string`, `bytes`, array o struct. Usa `constant` (si el valor se conoce al compilar) o una variable normal.

### `Initial value for constant variable has to be compile-time constant`

En `constant` no se pueden usar valores de ejecucion (`msg.sender`, `block.timestamp`). Si el valor se conoce al desplegar, usa `immutable`.

### Querer cambiar un `immutable` "solo una vez mas"

No hay forma. Si el valor debe poder cambiar, no era `immutable`.

## Ejercicios

1. Cambia `MAX_SUPPLY` a `immutable` y fijalo en el constructor. Que ventaja y que desventaja tiene?
2. Agrega un `immutable` `MAXIMO_DEPOSITO` que reciba el constructor y una funcion que lo use.
3. Compara con `gas-stats`: `npx hardhat test test/07-ConstantImmutable.ts --gas-stats`.

## Resumen

- `constant`: valor conocido al compilar. `immutable`: se fija una vez en el constructor.
- Ambos se guardan en el bytecode: leerlos es casi gratis comparado con storage.
- Nombres en `MAYUSCULAS` por convencion.
- Valida los valores antes de fijar un `immutable`: no se podran corregir despues.
