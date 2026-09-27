# 12 - Clones minimos y `CREATE2`

Dos tecnicas que resuelven problemas distintos, y que muchas fabricas de contratos usan juntas: **clones minimos** (EIP-1167) para desplegar copias baratas de un contrato, y **`CREATE2`** para saber la direccion de un contrato ANTES de desplegarlo.

Archivos de esta leccion:

- `contracts/12-ClonesCreate2.sol`
- `test/12-ClonesCreate2.ts`
- `ignition/modules/12-ClonesCreate2.ts`
- `scripts/deploy-ClonesCreate2.ts`

## El problema: `new Contrato()` es caro cuando lo repetis mucho

Cada `new Contrato()` (leccion 09 del modulo 02) despliega el bytecode COMPLETO del contrato. Si tu protocolo crea miles de instancias iguales (una wallet por usuario, un mercado por token, un vault por estrategia), pagar por desplegar el mismo bytecode una y otra vez es un desperdicio de gas enorme.

## Clones minimos (EIP-1167)

La idea: en vez de desplegar el contrato completo, desplegar un contrato de **45 bytes** cuyo unico trabajo es hacer `delegatecall` a una implementacion ya desplegada (leccion 09). Cada clon tiene su PROPIO storage (porque `delegatecall` opera sobre el storage de quien llama), pero comparte el codigo con todos los demas clones.

```solidity
bytes10 private constant _PREFIJO_CREACION = 0x3d602d80600a3d3981f3;
bytes10 private constant _PREFIJO_RUNTIME = 0x363d3d373d3d3d363d73;
bytes15 private constant _SUFIJO_RUNTIME = 0x5af43d82803e903d91602b57fd5bf3;

function _bytecodeClon(address implementacion) private pure returns (bytes memory) {
    return abi.encodePacked(_PREFIJO_CREACION, _PREFIJO_RUNTIME, implementacion, _SUFIJO_RUNTIME);
}
```

Este bytecode es un **estandar** (EIP-1167): siempre es igual, salvo los 20 bytes de la direccion de la implementacion en el medio. No hace falta entender cada opcode para usarlo, pero vale la pena saber que hace:

- Los primeros 10 bytes (`_PREFIJO_CREACION`) son codigo de "creacion": cuando la EVM ejecuta `create`/`create2` con este bytecode, esta parte copia los 45 bytes que siguen y los devuelve como el codigo FINAL del contrato desplegado.
- Los 45 bytes finales (prefijo de runtime + direccion + sufijo de runtime) son el codigo que efectivamente queda desplegado: en esencia, "copia todo el calldata recibido, hace `delegatecall` a la direccion embebida con ese calldata, y devuelve exactamente lo que la implementacion devolvio" (el mismo patron de `fallback()` que viste en la leccion 10, pero escrito directamente en bytecode en vez de en Solidity).

```solidity
function clonar(address implementacion) external returns (address clon) {
    bytes memory codigo = _bytecodeClon(implementacion);
    assembly {
        clon := create(0, add(codigo, 0x20), mload(codigo))
    }
    require(clon != address(0), "Clonacion fallida");
}
```

`create(valor, ptr, tamano)` es el opcode que despliega un contrato nuevo a partir del bytecode que esta en memoria entre `ptr` y `ptr + tamano`. `add(codigo, 0x20)` salta los primeros 32 bytes de `codigo` (que en un `bytes` de Solidity guardan el LARGO del array, no los datos), para apuntar a los datos reales; `mload(codigo)` lee ese largo.

```ts
const { result: direccionClon } = await fabrica.simulate.clonar([plantilla.address]);
await fabrica.write.clonar([plantilla.address]);

const clon = await viem.getContractAt("PlantillaContador", direccionClon);
await clon.write.inicializar([owner.account.address]);
await clon.write.incrementar();

assert.equal(await clon.read.contador(), 2n);
assert.equal(await plantilla.read.contador(), 0n); // la plantilla nunca se toco
```

Como cada clon tiene su propio storage, necesita su propia inicializacion (el mismo patron `initialize()` que viste en la leccion 11, en vez de un constructor).

## `CREATE2`: direcciones que se pueden predecir

`new Contrato()` (o `create`, en assembly) calcula la direccion resultante a partir de quien despliega y su **nonce** (un contador que sube con cada transaccion). Eso hace que la direccion dependa de CUANTAS transacciones mando esa cuenta antes: dificil de predecir de antemano si algo mas pudo haber pasado en el medio.

`create2` usa una formula distinta, que no depende del nonce:

```text
direccion = ultimos 20 bytes de keccak256(0xff ++ creador ++ salt ++ keccak256(bytecode_de_creacion))
```

```solidity
function calcularDireccion(address implementacion, bytes32 salt) external view returns (address predicho) {
    bytes32 hashBytecode = keccak256(_bytecodeClon(implementacion));

    predicho = address(
        uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, hashBytecode))))
    );
}
```

Como el `bytecode_de_creacion` y el `creador` (la fabrica) son conocidos, y el `salt` lo elige quien despliega, esta direccion se puede calcular **antes** de desplegar nada.

### Verificacion cruzada con una libreria independiente

Esta es la comprobacion mas fuerte de esta leccion: viem tiene su PROPIA implementacion de la formula de `CREATE2` (`getCreate2Address`), escrita por otro equipo, sin relacion con este codigo. El test calcula la direccion con el contrato Y con viem, por separado, y compara:

```ts
const predicho = await fabrica.read.calcularDireccion([plantilla.address, salt]);

const predichoConViem = getCreate2Address({
  from: fabrica.address,
  salt,
  bytecode: bytecodeClon(plantilla.address),
});

assert.equal(getAddress(predicho), getAddress(predichoConViem));
```

Que dos implementaciones completamente independientes lleguen al mismo resultado es una garantia mucho mas fuerte que "lei la formula y la escribi bien": si me hubiera equivocado en algun byte del calculo, esta comparacion lo habria detectado.

```ts
await fabrica.write.clonarDeterministico([plantilla.address, salt]);
// la direccion real coincide exactamente con lo predicho
```

## Usar el mismo `salt` dos veces

```ts
await fabrica.write.clonarDeterministico([plantilla.address, salt]);
await viem.assertions.revert(fabrica.write.clonarDeterministico([plantilla.address, salt]));
```

`CREATE2` con el mismo creador, mismo bytecode y mismo `salt` **siempre** da la misma direccion. Si ya hay un contrato desplegado ahi, el segundo intento revierte: no se puede desplegar dos veces en la misma direccion.

## Para que sirve esto en la practica

- **Direcciones "vanity" o predecibles**: calcular de antemano donde va a estar un contrato, para que otros contratos puedan referenciarlo antes de que exista (por ejemplo, en un sistema de wallets donde la direccion de la wallet se conoce antes de que el usuario la "active" desplegandola).
- **Multi-chain con la misma direccion**: si desplegas con el mismo creador, mismo bytecode y mismo salt en varias redes, el contrato queda en la MISMA direccion en todas.
- **Fabricas de clones**, como la de esta leccion: crear muchas instancias baratas, y opcionalmente en direcciones predecibles.

## Ejecutar el test

```bash
npx hardhat test test/12-ClonesCreate2.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ClonesCreate2.ts --network hardhatMainnet
```

## Errores comunes

### Olvidar inicializar un clon

Como los clones no tienen constructor (el bytecode desplegado es siempre el mismo, generico), un clon recien creado tiene TODO su storage en cero. Si tu implementacion depende de un `owner` o configuracion inicial, hace falta llamar a `initialize()` explicitamente despues de clonar.

### Confundir la direccion de la fabrica con la del clon

El `CREATE2` de esta leccion lo ejecuta la FABRICA (`address(this)` dentro de `calcularDireccion` es la fabrica, no quien la llama). Si la fabrica misma se redespliega en otra direccion, todas las direcciones predichas cambian.

### Reusar un `salt` sin verificar si ya se uso

Un intento de `CREATE2` sobre una direccion que ya tiene codigo revierte. Si tu logica de negocio depende de "puedo desplegar este salt", verifica primero con `calcularDireccion` + `code.length` en esa direccion.

## Ejercicios

1. Escribe una funcion `existeClon(address implementacion, bytes32 salt)` que use `calcularDireccion` y `.code.length` para saber si un clon ya fue desplegado, sin intentar desplegarlo.
2. Calcula a mano (con papel y una calculadora de keccak256) la direccion de un clon con un salt fijo, y confirmala contra el contrato.
3. Modifica `FabricaClones` para que registre en un array todos los clones creados, y agrega una funcion que los liste.

## Resumen

- Un clon minimo (EIP-1167) es un contrato de 45 bytes que reenvia todo con `delegatecall` a una implementacion compartida: mucho mas barato que desplegar el bytecode completo cada vez.
- Como cada clon tiene su propio storage, necesita inicializarse con una funcion (no con un constructor).
- `CREATE2` calcula la direccion a partir de creador + salt + hash del bytecode, sin depender del nonce: se puede predecir antes de desplegar.
- Verificar tu formula contra una libreria independiente (como `getCreate2Address` de viem) es una de las formas mas confiables de confirmar que esta bien.
