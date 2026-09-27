# 03 - Aritmetica y `unchecked`

Desde Solidity 0.8, la aritmetica (`+`, `-`, `*`, `/`, `**`) revierte sola si el resultado no entra en el tipo. `unchecked { ... }` apaga esa proteccion. Esta leccion muestra que se gana y que se pierde al usarlo, y un caso donde Solidity NUNCA protege, con o sin `unchecked`.

Archivos de esta leccion:

- `contracts/03-AritmeticaUnchecked.sol`
- `test/03-AritmeticaUnchecked.ts`
- `ignition/modules/03-AritmeticaUnchecked.ts`
- `scripts/deploy-AritmeticaUnchecked.ts`

## Underflow silencioso

```solidity
function retirarSinCheckVulnerable(uint256 monto) external {
    unchecked {
        balances[msg.sender] -= monto;
    }
}
```

Si `monto` es mayor que `balances[msg.sender]`, esta resta **no revierte**: da la vuelta. `10 - 11` en `uint256` no es `-1` (los `uint` no tienen negativos): es `2^256 - 1`, el numero mas grande que un `uint256` puede representar.

```ts
await contrato.write.depositar({ value: 10n });
await contrato.write.retirarSinCheckVulnerable([11n]);

assert.equal(await contrato.read.balances([owner.account.address]), maxUint256);
```

La version protegida (sin `unchecked`) revierte sola:

```solidity
function retirarConCheck(uint256 monto) external {
    balances[msg.sender] -= monto; // Panic(0x11) si monto > balance
}
```

## Overflow silencioso

Misma idea, con la suma:

```solidity
function sumarConOverflow(uint256 a, uint256 b) external pure returns (uint256) {
    unchecked {
        return a + b;
    }
}
```

```ts
assert.equal(await contrato.read.sumarConOverflow([maxUint256, 1n]), 0n); // da la vuelta a 0
```

Sin `unchecked`, `maxUint256 + 1` revierte con el mismo Panic 0x11 que viste en el modulo 02, leccion 11.

## Lo que `unchecked` NO cubre: las conversiones de tipo

Este es el punto que mas sorprende:

```solidity
function truncarAUint8(uint256 x) external pure returns (uint8) {
    return uint8(x);
}
```

```ts
assert.equal(await contrato.read.truncarAUint8([300n]), 44); // 300 mod 256
assert.equal(await contrato.read.truncarAUint8([256n]), 0);
```

`300` no entra en un `uint8` (que va de 0 a 255). Pero convertir `uint256` a `uint8` **nunca revierte**, ni dentro ni fuera de un bloque `unchecked`: es un descarte de bits (se queda solo con el ultimo byte, equivalente a `x % 256`), no una operacion aritmetica. Las protecciones de Solidity 0.8 son sobre `+`, `-`, `*`, `/`, `**`; **no** sobre conversiones explicitas de tipo.

Esto importa en la practica: si guardas una cantidad en `uint256` y en algun punto la conviertes a `uint128` o `uint64` (por ejemplo, para empaquetar storage, leccion 05), y el valor real es mas grande de lo que ese tipo puede representar, la conversion trunca en silencio sin avisarte.

## El buen uso de `unchecked`: contadores de loop

```solidity
function sumarArray(uint256[] calldata datos) external pure returns (uint256 total) {
    uint256 length = datos.length;

    for (uint256 i = 0; i < length; ) {
        total += datos[i];

        unchecked {
            ++i;
        }
    }
}
```

`i` nunca puede desbordar dentro de los limites del propio `for` (el array nunca tiene `2^256` elementos), asi que el chequeo automatico de overflow en `++i` es gasto puro. Este es el uso de `unchecked` mas comun y mas seguro en codigo real: contadores de loop cuyo limite ya esta acotado por otra cosa (el largo de un array, un numero fijo de iteraciones).

## Como decidir si un `unchecked` es seguro

Antes de envolver algo en `unchecked`, responde: **"puedo demostrar, sin ejecutar el codigo, que este overflow/underflow es imposible?"**

- `++i` en un `for` acotado por `array.length`: si, el array nunca crece infinitamente en la misma transaccion.
- `balances[msg.sender] -= monto` sin haber comprobado `monto <= balance` antes: no, `monto` puede venir de cualquier lado.
- Una suma de dos valores que vienen de datos externos, sin cotas conocidas: casi nunca.

Si no podes demostrarlo con certeza, no uses `unchecked`. El gas que ahorras no vale el riesgo.

## Ejecutar el test

```bash
npx hardhat test test/03-AritmeticaUnchecked.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-AritmeticaUnchecked.ts --network hardhatMainnet
```

## Errores comunes

### Pensar que Solidity 0.8 "ya no tiene bugs de overflow"

Los tiene, dentro de `unchecked`, y en las conversiones de tipo (que ni siquiera necesitan `unchecked`). "Uso Solidity 0.8+" no es, por si solo, una garantia.

### Usar `unchecked` "porque el gas importa" sin analizar el caso

El ahorro de gas de `unchecked` es real pero chico comparado con el riesgo cuando se usa mal. Reservalo para casos donde puedas justificar por que es imposible que falle.

### Convertir tipos sin validar el rango antes

Si vas a guardar un `uint256` en un campo `uint128` (por ejemplo, para empaquetar un struct), valida `require(valor <= type(uint128).max)` ANTES de convertir, si existe la posibilidad de que el valor sea mayor.

## Ejercicios

1. Escribe una funcion `sumarSeguro(uint128[] calldata datos)` que sume valores en un `uint256` y los devuelva convertidos a `uint128`, validando que el total no se pase del rango antes de convertir.
2. Demuestra con un test que sumar dos `uint128` cercanos a su maximo, sin `unchecked`, revierte solo (porque `uint128` tambien tiene proteccion automatica, no solo `uint256`).
3. Escribe una version de `retirarSinCheckVulnerable` que la explote un atacante: deposita 1, retira `type(uint256).max`, y usa el balance resultante (gigante) para vaciar el contrato con retiros "normales" despues.

## Resumen

- Solidity 0.8+ protege `+`, `-`, `*`, `/`, `**` automaticamente; `unchecked` apaga esa proteccion.
- Un underflow/overflow dentro de `unchecked` da la vuelta en silencio, sin revertir.
- Las conversiones de tipo (`uint8(x)`) NUNCA revierten por perdida de datos: truncan siempre, con o sin `unchecked`.
- Usa `unchecked` solo cuando puedas demostrar que el overflow/underflow es imposible (el ejemplo clasico: contadores de loop acotados).
