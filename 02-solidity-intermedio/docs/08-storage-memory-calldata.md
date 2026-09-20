# 08 - `storage`, `memory` y `calldata`

Cuando una variable es de un tipo **por referencia** (arrays, structs, strings, bytes, mappings), Solidity te pide indicar **donde vive**. Es una de las decisiones que mas afectan al gas y a la correccion.

Archivos de esta leccion:

- `contracts/08-StorageMemoryCalldata.sol`
- `test/08-StorageMemoryCalldata.ts`
- `ignition/modules/08-StorageMemoryCalldata.ts`
- `scripts/deploy-StorageMemoryCalldata.ts`

## Las tres ubicaciones

| Ubicacion | Donde vive | Dura | Modificable | Coste |
| --- | --- | --- | --- | --- |
| `storage` | En la blockchain, dentro del contrato | Para siempre | Si | Muy alto |
| `memory` | En la memoria temporal de la EVM | Solo durante la llamada | Si | Bajo |
| `calldata` | En los datos de entrada de la transaccion | Solo durante la llamada | **No** | El mas bajo |

Los tipos simples (`uint256`, `bool`, `address`) no necesitan indicarlo.

## `storage`: un puntero al dato real

Las variables de estado del contrato viven en storage. Una variable local `storage` es solo una **referencia** a ellas:

```solidity
Usuario[] public usuarios;

function sumarPuntosEnStorage(uint256 indice, uint256 extra) external {
    Usuario storage u = usuarios[indice];   // puntero, no copia
    u.puntos += extra;                       // modifica el dato real
}
```

Sin `storage`, cambiar `u.puntos` no cambiaria nada.

## `memory`: una copia temporal

```solidity
function sumarPuntosEnMemory(uint256 indice, uint256 extra) external view returns (uint256) {
    Usuario memory u = usuarios[indice];   // COPIA a memoria
    u.puntos += extra;                      // modifica la copia
    return u.puntos;
}
```

Se **copia** todo el struct de storage a memory (cuesta gas por cada campo) y el cambio muere al terminar la funcion. El test lo demuestra:

```ts
await contrato.write.agregarUsuario(["Ana", 10n]);

assert.equal(await contrato.read.sumarPuntosEnMemory([0n, 5n]), 15n);      // la copia cambio
assert.deepEqual(await contrato.read.usuarios([0n]), ["Ana", 10n]);       // storage no
```

Es uno de los errores mas comunes: escribir `memory` cuando querias modificar el dato guardado, y ver que "no pasa nada".

Regla practica:

- Vas a **modificar** el dato guardado -> `storage`.
- Solo vas a **leer** varias veces un dato y quieres evitar releer storage -> copiar a `memory` (o leer solo los campos que necesitas).

## `calldata`: la entrada sin copiar

`calldata` apunta directamente a los bytes que el usuario envio en la transaccion. No se copia y no se puede modificar:

```solidity
function sumarCalldata(uint256[] calldata datos) external pure returns (uint256 total) { ... }
function sumarMemory(uint256[] memory datos) external pure returns (uint256 total) { ... }
```

Ambas dan el mismo resultado, pero `sumarMemory` **copia** el array a memoria antes de empezar. Con arrays grandes eso cuesta mucho. El test compara el gas con 100 elementos:

```ts
assert.ok(gasCalldata < gasMemory);
```

Regla practica: en funciones `external`, usa `calldata` para arrays, structs y strings de solo lectura.

Si necesitas modificar el parametro, tienes que usar `memory` (o crear un array nuevo en memoria, como hace `duplicar`).

## Crear datos nuevos en `memory`

```solidity
function duplicar(uint256[] calldata datos) external pure returns (uint256[] memory resultado) {
    resultado = new uint256[](datos.length);   // los arrays en memory tienen tamano fijo
    for (uint256 i = 0; i < datos.length; i++) {
        resultado[i] = datos[i] * 2;
    }
}
```

Los arrays en `memory` no tienen `push`: su tamano se decide al crearlos con `new uint256[](n)`.

## Que pasa al asignar entre ubicaciones

| Asignacion | Resultado |
| --- | --- |
| variable de estado -> variable local `storage` | Puntero (misma referencia) |
| variable de estado -> otra variable de estado | **Copia** |
| `storage` -> `memory` | **Copia** |
| `memory` -> `storage` | **Copia** (escribe en la blockchain) |
| `calldata` -> `memory` | **Copia** |
| `calldata` -> `calldata` | Puntero |
| `memory` -> `memory` | Puntero |

## Strings y bytes

`string` y `bytes` tambien son por referencia:

```solidity
function agregarUsuario(string calldata nombre, uint256 puntos) external {
    usuarios.push(Usuario(nombre, puntos));   // al guardar, se copia a storage
}
```

Recibirlo como `calldata` evita una copia intermedia a memoria: solo se copia una vez, a storage.

## Structs y arrays publicos

`Usuario[] public usuarios` genera un getter `usuarios(indice)` que devuelve los campos del struct como una tupla. En viem llega como array: `["Ana", 10n]`.

## Cuanto cuesta cada cosa (orden de magnitud)

| Operacion | Gas |
| --- | --- |
| Escribir un slot nuevo en storage | ~22 100 |
| Modificar un slot existente | ~5 000 |
| Leer un slot de storage (frio) | 2 100 |
| Leer memoria | ~3 |
| Leer calldata | ~3 (+ coste por byte al enviarla) |

Por eso los bucles que leen storage muchas veces son caros: si vas a usar `usuarios.length` en cada iteracion, guardalo en una variable local primero.

## Ejecutar el test

```bash
npx hardhat test test/08-StorageMemoryCalldata.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-StorageMemoryCalldata.ts --network hardhatMainnet
```

## Errores comunes

### `Data location must be "memory" or "calldata" for parameter`

Falta indicar la ubicacion de un parametro de tipo array, struct o string.

### `Calldata arrays cannot be modified`

Intentas escribir en un parametro `calldata`. Copialo a `memory` si necesitas modificarlo.

### Modificar una copia sin darte cuenta

Es el bug de `memory` vs `storage`: el codigo compila y ejecuta, pero no guarda nada.

## Ejercicios

1. Cambia `sumarPuntosEnStorage` para usar `memory` y observa que el test de storage falla.
2. Agrega una funcion `nombreDe(uint256 indice)` que devuelva `string memory` leyendo de storage.
3. Mide el gas de `sumarCalldata` vs `sumarMemory` con arrays de 10, 100 y 500 elementos.

## Resumen

- `storage` es persistente y caro: una variable local `storage` es un puntero al dato real.
- `memory` es una copia temporal: cambiarla no afecta a storage.
- `calldata` es la entrada de solo lectura: la opcion mas barata en funciones `external`.
- Asignar entre ubicaciones distintas **copia** los datos.
