# 14 - ERC-4626: bovedas tokenizadas

ERC-4626 estandariza los "vaults" (bovedas): contratos que reciben un activo (por ejemplo, un token ERC-20) y a cambio dan "acciones" (shares) que representan una porcion del total depositado. Esta leccion tambien muestra el ataque mas famoso contra implementaciones ingenuas de este estandar, y como se mitiga.

Archivos de esta leccion:

- `contracts/14-ERC4626Basico.sol`
- `test/14-ERC4626Basico.ts`
- `ignition/modules/14-ERC4626Basico.ts`
- `scripts/deploy-ERC4626Basico.ts`

## La idea, con numeros

Depositas 1000 de un token. Si sos el primero, recibis 1000 acciones (1 a 1). Si otras personas depositan y la boveda GANA valor con el tiempo (intereses de un protocolo de prestamos, comisiones, lo que sea), cada accion pasa a valer MAS que 1 unidad del token original, sin que nadie tenga que reclamar nada activamente: alcanza con "canjear" tus acciones mas adelante para recibir tu parte proporcional, ya crecida.

## Las formulas centrales

```solidity
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
```

`totalAssets()` es cuanto del token subyacente tiene la boveda en este momento. La relacion `totalSupply / totalAssets()` es, en esencia, "cuanto vale una accion en este momento". Sin nada depositado todavia, 1 activo = 1 accion, por definicion.

## El ataque: inflacion del primer deposito

Quien deposita PRIMERO, cuando `totalSupply` todavia es 0, fija esa relacion para todos los que vengan despues. Eso es una oportunidad de ataque.

**Paso 1.** El atacante deposita una cantidad minima (1 unidad). Como es el primer deposito, `totalSupply` era 0, asi que recibe exactamente 1 accion.

```ts
await boveda.write.deposit([1n, atacante.account.address], { account: atacante.account });
assert.equal(await boveda.read.totalSupply(), 1n);
```

**Paso 2.** El atacante DONA activo directamente a la boveda (un `transfer` normal, no un `deposit()`). Esto infla `totalAssets()` sin acunar ninguna accion nueva.

```ts
await activo.write.transfer([boveda.address, 2_000n], { account: atacante.account });
assert.equal(await boveda.read.totalAssets(), 2_001n);
```

**Paso 3.** Una victima deposita de buena fe. Sus acciones se calculan como `(1000 * 1) / 2001`, que en division entera da **0**.

```ts
await boveda.write.deposit([1_000n, victima.account.address], { account: victima.account });
assert.equal(await boveda.read.balanceOf([victima.account.address]), 0n);
```

La victima transfirio 1000 unidades del token a la boveda y no recibio **nada** a cambio: cero acciones. Nota importante: el contrato NO revierte esta transaccion (no hay ningun `require(shares > 0)` en la version vulnerable). Muchas implementaciones ingenuas de ERC-4626 tampoco lo tienen, y por eso el deposito de la victima simplemente "desaparece" en la boveda sin que nadie note el error hasta que es tarde.

**Paso 4.** El atacante, dueno de la UNICA accion en circulacion, redime esa accion y se lleva TODO lo que hay en la boveda: su propio deposito, su donacion, y el deposito completo de la victima.

```ts
await boveda.write.redeem([1n, atacante.account.address, atacante.account.address], { account: atacante.account });
// ganancia >= 1000: el atacante se llevo el deposito entero de la victima
```

## La mitigacion: acciones muertas

La idea: obligar a que el primer deposito sea grande, y "quemar" (nunca asignar a ninguna cuenta) una parte fija de las acciones resultantes. Esto sube el "piso" de `totalSupply` desde el primer momento, lo que hace mucho mas dificil licuar la relacion con una simple donacion.

```solidity
uint256 public constant ACCIONES_MUERTAS = 1_000;

function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
    if (!_semillaCreada) {
        require(assets > ACCIONES_MUERTAS, "El primer deposito debe ser grande");

        _semillaCreada = true;
        totalSupply += ACCIONES_MUERTAS; // quemadas: nadie las posee
        shares = assets - ACCIONES_MUERTAS;
    } else {
        shares = convertToShares(assets);
    }
    // ...
}
```

Repitiendo el mismo ataque contra esta version:

```ts
// El primer deposito minusculo ya no es posible.
await viem.assertions.revertWith(
  boveda.write.deposit([1n, atacante.account.address], { account: atacante.account }),
  "El primer deposito debe ser grande",
);

// El atacante paga el "piso": deposita 1001, recibe solo 1 accion (1001 - 1000 quemadas).
await boveda.write.deposit([1_001n, atacante.account.address], { account: atacante.account });
// totalSupply = 1001 (1 real + 1000 quemadas)

await activo.write.transfer([boveda.address, 2_000n], { account: atacante.account }); // la misma donacion

await boveda.write.deposit([1_000n, victima.account.address], { account: victima.account });

const accionesVictima = await boveda.read.balanceOf([victima.account.address]);
assert.ok(accionesVictima > 0n, "la victima deberia haber recibido acciones");
```

Con el piso de 1000 acciones muertas ya en `totalSupply` desde el principio, la MISMA donacion relativa ya no alcanza para licuar al siguiente depositante hasta cero: la victima recibe una cantidad de acciones proporcional y razonable, y puede canjearlas por activo real despues.

## Por que esto es un problema real, no teorico

Este ataque (conocido como "vault inflation attack" o "first depositor attack") afecto a protocolos reales en produccion. La version de OpenZeppelin de ERC-4626 usa una mitigacion mas sofisticada ("decimals offset", acciones virtuales que nunca se materializan pero siempre estan presentes en el calculo), con el mismo objetivo que las acciones muertas de esta leccion: asegurar que `totalSupply` nunca sea tan chico como para que una donacion lo domine.

## Ejecutar el test

```bash
npx hardhat test test/14-ERC4626Basico.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ERC4626Basico.ts --network hardhatMainnet
```

## Errores comunes

### Pensar que "nadie va a donar tokens sin usar deposit()"

Cualquiera puede hacer un `transfer()` normal de un ERC-20 hacia la direccion de la boveda, sin pasar por ninguna funcion del vault. Esa transferencia sube `totalAssets()` igual, y el contrato no tiene forma de distinguir "esto es una donacion malintencionada" de "esto es interes ganado legitimamente" (de hecho, para un vault que genera intereses reales, ese mecanismo es exactamente COMO se refleja la ganancia).

### Confiar en que "division entera nunca da cero" sin revisarlo

`(assets * supply) / totalAssets` puede dar exactamente 0 si `assets * supply < totalAssets`. Esto no es un bug del lenguaje: es aritmetica de enteros funcionando como se espera, aplicada a una formula que no anticipo el caso.

### Copiar la formula sin las acciones muertas (o el offset de decimales)

La formula por si sola es correcta matematicamente; el ataque depende de que `totalSupply` pueda ser artificialmente chico. Cualquier vault de produccion necesita una mitigacion para el primer deposito.

## Ejercicios

1. Calcula a mano cuantas acciones muertas harian falta para que el mismo ataque, con una donacion de 1,000,000 en vez de 2,000, siguiera dejando a la victima con acciones mayores a cero.
2. Agrega una funcion `previewDeposit(uint256 assets)` que devuelva las acciones esperadas SIN ejecutar el deposito (parte del estandar ERC-4626 real).
3. Investiga como implementa OpenZeppelin el "decimals offset" en su `ERC4626.sol`, y compara con las acciones muertas de esta leccion: que ventaja tiene el offset sobre quemar acciones reales?

## Resumen

- ERC-4626 convierte depositos de un activo en "acciones" proporcionales al total depositado.
- Quien deposita primero, cuando `totalSupply` es 0, fija la relacion inicial: eso es una superficie de ataque.
- El ataque de inflacion combina un primer deposito minimo con una donacion directa, dejando a la siguiente persona con CERO acciones por su deposito completo.
- Las "acciones muertas" (o el offset de decimales de OpenZeppelin) suben el piso de `totalSupply` desde el principio, haciendo el ataque mucho menos efectivo.
