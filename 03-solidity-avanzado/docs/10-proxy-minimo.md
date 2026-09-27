# 10 - Proxies minimos (EIP-1967)

Con `delegatecall` (leccion 09) ya tenes todo lo necesario para entender un proxy: un contrato con una direccion fija, que reenvia cada llamada al codigo de una "implementacion" que se puede cambiar.

Archivos de esta leccion:

- `contracts/10-ProxyMinimo.sol`
- `test/10-ProxyMinimo.ts`
- `ignition/modules/10-ProxyMinimo.ts`
- `scripts/deploy-ProxyMinimo.ts`

## La idea, en un diagrama

```text
Usuario
  |
  | llama siempre a la MISMA direccion
  v
Proxy (direccion fija, storage propio)
  |
  | delegatecall
  v
Implementacion V1 (o V2, o V3...)
```

El proxy nunca cambia de direccion. Lo que cambia es a que implementacion apunta. Cada llamada que el proxy recibe (salvo un par de funciones propias) se reenvia con `delegatecall`, asi que se ejecuta con el storage del PROXY, no el de la implementacion (leccion 09).

## Donde se guarda la direccion de la implementacion

Podria guardarse en una variable normal (slot 0, por ejemplo), pero eso tiene un problema: si alguna version futura de la implementacion declara SU PROPIA variable en el slot 0, colisiona con el slot que el proxy usa para su propia contabilidad (exactamente el bug de la leccion 09).

La solucion, estandarizada en **EIP-1967**, es guardar la direccion en un slot "raro", calculado para que sea practicamente imposible que choque por accidente:

```solidity
bytes32 private constant _SLOT_IMPLEMENTACION =
    0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
```

Ese numero es `keccak256("eip1967.proxy.implementation") - 1`. Restar 1 es deliberado: si alguien intenta encontrar una colision (un `slot = keccak256(x)` para algun `x` cualquiera) es dificil; encontrar un `x` que satisfaga `keccak256(x) - 1 = keccak256("otracosa")` es, en la practica, igual de dificil, pero la resta ademas asegura que el slot no coincide con ningun slot que resultaria de las formulas normales de mappings/arrays (leccion 07), que siempre son `keccak256(algo)` sin restar.

Como ese slot es un estandar (EIP-1967), herramientas como Etherscan saben leerlo directamente y mostrarte "este contrato es un proxy, y su implementacion actual es esta direccion" sin que tengas que decirselo.

## Leer y escribir ese slot con assembly

```solidity
function implementacion() public view returns (address impl) {
    bytes32 slot = _SLOT_IMPLEMENTACION;
    assembly {
        impl := sload(slot)
    }
}

function _establecerImplementacion(address nueva) internal {
    bytes32 slot = _SLOT_IMPLEMENTACION;
    assembly {
        sstore(slot, nueva)
    }
}
```

Como ese slot no corresponde a ninguna variable Solidity declarada normalmente, hace falta `sload`/`sstore` en assembly (leccion 08) para leerlo y escribirlo directamente.

**Verificacion, no solo explicacion:** el test de esta leccion lee ese slot con `publicClient.getStorageAt` usando el numero exacto de arriba, y confirma que ahi vive la direccion de la implementacion:

```ts
const crudo = await publicClient.getStorageAt({ address: proxy.address, slot: SLOT_IMPLEMENTACION });
const direccionCruda = getAddress(`0x${crudo!.slice(-40)}`);

assert.equal(direccionCruda, getAddress(v1.address));
```

## El `fallback()`: donde ocurre el reenvio

```solidity
fallback() external payable {
    _delegar(implementacion());
}

function _delegar(address impl) internal {
    assembly {
        calldatacopy(0, 0, calldatasize())
        let resultado := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
        returndatacopy(0, 0, returndatasize())

        switch resultado
        case 0 { revert(0, returndatasize()) }
        default { return(0, returndatasize()) }
    }
}
```

Paso a paso:

1. `calldatacopy(0, 0, calldatasize())`: copia TODOS los datos de la llamada (la funcion pedida y sus argumentos) a la memoria del proxy.
2. `delegatecall(gas(), impl, 0, calldatasize(), 0, 0)`: ejecuta el codigo de `impl`, pasandole esos mismos datos, con TODO el gas disponible.
3. `returndatacopy(0, 0, returndatasize())`: copia lo que la implementacion devolvio.
4. Si `delegatecall` fallo (`resultado == 0`), revierte con el mismo motivo que dio la implementacion. Si tuvo exito, devuelve exactamente lo que la implementacion devolvio.

Este patron reenvia **cualquier** llamada, sin que el proxy tenga que conocer de antemano que funciones existen en la implementacion. Es lo que permite que, del lado de quien usa el contrato, el proxy sea indistinguible de la implementacion misma.

## Como se prueba un proxy (el patron que vas a usar siempre)

```ts
const proxyComoV1 = await viem.getContractAt("ImplementacionV1", proxy.address);

await proxyComoV1.write.establecer([10n]);
assert.equal(await proxyComoV1.read.valor(), 10n);
```

`proxy` es la instancia REAL, desplegada como `ProxyMinimo`; su ABI solo conoce `implementacion()` y `actualizar()`. Para llamar a funciones de la implementacion (que el proxy no declara, pero que sabe REENVIAR), se usa `viem.getContractAt` con el nombre de la implementacion pero la DIRECCION del proxy: esto genera una instancia tipada con el ABI correcto, apuntando a la direccion correcta. Cuando llamas `proxyComoV1.write.establecer(...)`, viem codifica la llamada como si fuera para `ImplementacionV1`, pero la envia a la direccion del proxy; el `fallback()` del proxy la recibe y la reenvia por `delegatecall`.

## Actualizar sin perder el estado

```ts
const proxyComoV1 = await viem.getContractAt("ImplementacionV1", proxy.address);
await proxyComoV1.write.establecer([10n]);

await proxy.write.actualizar([v2.address]);

const proxyComoV2 = await viem.getContractAt("ImplementacionV2", proxy.address);
assert.equal(await proxyComoV2.read.valor(), 10n); // el 10 sigue ahi
```

`actualizar()` solo cambia QUE CODIGO se ejecuta (el slot de implementacion). El slot 0 del proxy (donde vive `valor`, porque `ImplementacionV1` y `ImplementacionV2` declaran esa variable en la MISMA posicion) nunca se toco. Esto es la esencia de un contrato "actualizable": la direccion y el estado permanecen; el comportamiento cambia.

## Ejecutar el test

```bash
npx hardhat test test/10-ProxyMinimo.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ProxyMinimo.ts --network hardhatMainnet
```

## Errores comunes

### Olvidar el `receive()` si el proxy necesita recibir ETH sin datos

`fallback()` se ejecuta cuando los datos no coinciden con ninguna funcion conocida (que, en un proxy, es "siempre", salvo `implementacion()`/`actualizar()`). Pero un envio de ETH SIN datos (una transferencia simple) llama a `receive()` si existe, o revierte si no. El proxy de esta leccion define ambos, apuntando a la misma logica de reenvio.

### Actualizar a una implementacion con otro layout de storage

Esto es exactamente el bug de la leccion 09, aplicado a un proxy real. La leccion 11 lo muestra en detalle, con las reglas para evitarlo.

### Dejar `actualizar()` sin control de acceso

Si cualquiera puede llamar `actualizar()`, cualquiera puede reemplazar TODO el comportamiento del contrato. El proxy de esta leccion restringe `actualizar()` al `admin` fijado en el constructor.

## Ejercicios

1. Intenta actualizar a una direccion que no es un contrato (una EOA) y confirma que `_establecerImplementacion` lo rechaza.
2. Agrega un evento `Llamada(address indexed implementacion, bytes4 selector)` que se emita en cada reenvio (dificil: hace falta leerlo desde el propio `calldata` en assembly).
3. Escribe un test que despliegue 3 versiones de implementacion y las vaya actualizando en secuencia, verificando el estado en cada paso.

## Resumen

- Un proxy tiene una direccion fija y reenvia llamadas con `delegatecall` a una implementacion que se puede cambiar.
- La direccion de la implementacion se guarda en un slot "raro" (EIP-1967), para evitar colisiones con las variables de la implementacion.
- El `fallback()` copia el calldata, hace el `delegatecall`, y devuelve (o revierte con) lo que la implementacion respondio.
- Para probar un proxy, se usa el ABI de la implementacion apuntando a la direccion del proxy (`viem.getContractAt`).
