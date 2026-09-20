# 10 - Llamadas de bajo nivel (`call`)

Ademas de llamar funciones con una interfaz, Solidity permite hacer llamadas "en crudo": `call`, `staticcall` y `delegatecall`. Son la base de todo lo demas y la forma correcta de enviar ETH, pero exigen cuidado.

Archivos de esta leccion:

- `contracts/10-LowLevelCall.sol`
- `test/10-LowLevelCall.ts`
- `ignition/modules/10-LowLevelCall.ts`
- `scripts/deploy-LowLevelCall.ts`

## Que es una llamada de bajo nivel

Una llamada normal (`otro.establecer(5)`) hace tres cosas por ti:

1. Codifica la funcion y los argumentos.
2. Envia la llamada.
3. **Revierte automaticamente si el destino falla** y decodifica el resultado.

Con `call` haces esos pasos a mano:

```solidity
(bool ok, bytes memory datos) = objetivo.call(
    abi.encodeWithSignature("establecer(uint256)", 7)
);
```

Devuelve dos cosas:

- `ok`: `true` si la llamada tuvo exito, `false` si fallo.
- `datos`: los bytes de retorno (o el error codificado si fallo).

## La regla de oro: revisa siempre `ok`

`call` **no revierte** cuando el destino falla. Si no revisas `ok`, tu contrato sigue como si nada hubiera pasado:

```solidity
objetivo.call(...);          // MAL: ignora el resultado
```

Siempre:

```solidity
(bool ok, bytes memory datos) = objetivo.call(...);
if (!ok) revert LlamadaFallida(datos);
```

En el test se ve la diferencia: `llamarInexistente` y `llamarQueFalla` devuelven `false` sin revertir, mientras que `llamarConEncodeCall` propaga el fallo con `LlamadaFallida`.

## Codificar la llamada

### Con firma en texto

```solidity
abi.encodeWithSignature("establecer(uint256)", n)
```

Es facil pero **no lo valida el compilador**: si escribes `"establecer(uint)"` (sin el `256`), calcula otro selector y la llamada falla en silencio.

### Con `abi.encodeCall` (recomendado)

```solidity
abi.encodeCall(ObjetivoBajoNivel.establecer, (n))
```

El compilador comprueba que la funcion exista y que los tipos de los argumentos coincidan. Casi siempre es mejor.

### Selector

Los primeros 4 bytes de una llamada son el **selector**: los primeros 4 bytes del `keccak256` de la firma.

```solidity
bytes4(keccak256("establecer(uint256)"))   // 0xf9664187
```

La EVM usa el selector para decidir a que funcion saltar. Lo puedes calcular en TypeScript con `toFunctionSelector("establecer(uint256)")` de viem.

## Enviar ETH con `call`

```solidity
(bool ok, ) = destino.call{value: monto}("");
if (!ok) revert EnvioFallido();
```

Es la forma **recomendada** de enviar ETH. Las alternativas antiguas, `transfer` y `send`, limitan el gas a 2300, y eso rompe con contratos receptores que necesitan un poco mas (por ejemplo, wallets multi-firma). Desde el hard fork Istanbul, `call` es el estandar.

Como `call` da todo el gas al destino, **combinalo con checks-effects-interactions y un guard de reentrada** (leccion 06).

El test envia ETH a una cuenta y comprueba que el balance sube exactamente lo enviado. Cuando el destino no acepta ETH (`ObjetivoBajoNivel` no tiene `receive()`), la funcion revierte con `EnvioFallido`.

## `receive` y `fallback`

Cuando llamas a un contrato con datos que no coinciden con ninguna funcion:

| Situacion | Que se ejecuta |
| --- | --- |
| Sin datos y con ETH | `receive()`, si existe |
| Datos que no coinciden con ninguna funcion | `fallback()`, si existe |
| No existe la funcion adecuada | La llamada **revierte** |

`ObjetivoBajoNivel` no define ninguno: por eso llamar una funcion inexistente o enviarle ETH a secas falla. Lo repasaste en el modulo 01 (`16-ReceiveFallback.sol`).

## `staticcall`

Es una llamada **de solo lectura**: si el destino intenta modificar estado (escribir storage, emitir eventos, enviar ETH), la llamada falla.

```solidity
(bool ok, bytes memory datos) = objetivo.staticcall(abi.encodeCall(ObjetivoBajoNivel.leer, ()));
return abi.decode(datos, (uint256));
```

Las funciones `view` y `pure` externas se llaman internamente con `staticcall`. Usarlo a mano garantiza que la llamada no cambia nada.

`abi.decode(datos, (uint256))` convierte los bytes de vuelta al tipo. Debes conocer el tipo con antelacion.

## `delegatecall` (solo un vistazo)

`delegatecall` ejecuta el **codigo** de otro contrato pero sobre el **storage y el contexto del que llama**. Es la base de los proxies actualizables y de las librerias enlazadas. Es potente y muy peligroso: un error de layout de storage corrompe el contrato. Se estudia en el modulo 03.

| | `call` | `staticcall` | `delegatecall` |
| --- | --- | --- | --- |
| Codigo que se ejecuta | Del destino | Del destino | Del destino |
| Storage que se usa | Del destino | Del destino | **Del que llama** |
| Puede modificar estado | Si | No | Si (el del que llama) |
| `msg.sender` dentro | Quien llama | Quien llama | El sender **original** |

## Cuando usar `call` y cuando la interfaz

- Con una interfaz conocida: usa la **interfaz** (mas seguro, tipado, revierte solo).
- Para enviar ETH: usa `call{value: ...}("")`.
- Para direcciones y datos que no conoces en compilacion (ej. una funcion de gobernanza que ejecuta llamadas arbitrarias): `call` con validaciones.

## Ejecutar el test

```bash
npx hardhat test test/10-LowLevelCall.ts
```

Para ver el valor de retorno de una funcion que escribe estado, el test usa `simulate` de viem, que ejecuta la llamada sin enviarla:

```ts
const resultado = await llamador.simulate.llamarInexistente([objetivo.address]);
assert.equal(resultado.result[0], false);
```

## Desplegar

```bash
npx hardhat run scripts/deploy-LowLevelCall.ts --network hardhatMainnet
```

## Errores comunes

### Ignorar el booleano de retorno

El fallo mas peligroso. El compilador da un warning ("Return value of low-level calls not used"): nunca lo ignores.

### Firma mal escrita

`"transfer(address,uint)"` en lugar de `"transfer(address,uint256)"` da otro selector.

### Suponer que `call` a una cuenta sin codigo falla

Una llamada a una direccion sin contrato **tiene exito** y devuelve datos vacios. Si necesitas asegurar que hay un contrato, comprueba `destino.code.length > 0`.

## Ejercicios

1. Agrega una funcion que use `call` con la firma en texto mal escrita y comprueba que devuelve `ok == false`.
2. Escribe una funcion `enviarAVarios(address payable[] calldata destinos, uint256 monto)` con `call` y revisa cada resultado.
3. Decodifica el mensaje del error de `llamarQueFalla` (`Error(string)`) usando `decodeErrorResult` de viem.

## Resumen

- `call` devuelve `(ok, datos)` y **no revierte solo**: revisa siempre `ok`.
- `abi.encodeCall` es mas seguro que `abi.encodeWithSignature`.
- `call{value: ...}("")` es la forma recomendada de enviar ETH.
- `staticcall` es de solo lectura; `delegatecall` usa el storage del que llama (modulo 03).
