# 11 - `try/catch`

Por defecto, si una llamada externa falla, **tu funcion tambien revierte**. `try/catch` te permite atrapar ese fallo y decidir que hacer: reintentar, usar otro camino o registrar el error.

Archivos de esta leccion:

- `contracts/11-TryCatch.sol`
- `test/11-TryCatch.ts`
- `ignition/modules/11-TryCatch.ts`
- `scripts/deploy-TryCatch.ts`

## Sintaxis

```solidity
try otro.funcion(args) returns (uint256 resultado) {
    // la llamada tuvo exito
} catch Error(string memory razon) {
    // fallo con require/revert con mensaje
} catch Panic(uint256 codigo) {
    // fallo con un panic (division por cero, overflow, assert...)
} catch (bytes memory datos) {
    // cualquier otro fallo (incluye errores personalizados)
}
```

No hace falta escribir todos los `catch`: puedes usar solo el que te interese. Pero si quieres atrapar **todo**, incluye `catch (bytes memory)` o un `catch { ... }` sin parametros.

## Dos limitaciones importantes

1. **Solo funciona con llamadas externas y con `new`.** No sirve para funciones internas del mismo contrato.
2. **Solo atrapa fallos del destino.** Si el destino tiene exito pero devuelve datos que no se pueden decodificar, el error ocurre en tu contrato y `try/catch` no lo atrapa.

Tambien: el propio contrato que llama puede quedarse sin gas. Al hacer una llamada externa, la EVM reserva 1/64 del gas para el llamador, pero un destino que consuma casi todo el gas puede dejar poco para el `catch`.

## Los tres tipos de fallo

`Riesgoso` genera un fallo de cada clase:

```solidity
contract Riesgoso {
    error SaldoInsuficiente(uint256 pedido, uint256 disponible);

    function dividir(uint256 a, uint256 b) external pure returns (uint256) {
        return a / b;                                          // Panic 0x12
    }

    function exigirPositivo(uint256 x) external pure returns (uint256) {
        require(x > 0, "x debe ser mayor a cero");            // Error(string)
        return x;
    }

    function retirar(uint256 pedido) external pure returns (uint256) {
        if (pedido > 10) revert SaldoInsuficiente(pedido, 10); // error personalizado
        return pedido;
    }

    function romperInvariante() external pure {
        assert(false);                                         // Panic 0x01
    }
}
```

### `catch Error(string)`

Atrapa `require(cond, "mensaje")` y `revert("mensaje")`. Recibes el texto:

```solidity
try riesgoso.exigirPositivo(x) returns (uint256) {
    return (true, "");
} catch Error(string memory mensaje) {
    return (false, mensaje);    // "x debe ser mayor a cero"
}
```

### `catch Panic(uint256)`

Los **panic** son errores que genera el propio compilador. Cada uno tiene un codigo:

| Codigo | Causa |
| --- | --- |
| `0x01` | `assert` fallido |
| `0x11` | Overflow o underflow aritmetico |
| `0x12` | Division o modulo por cero |
| `0x21` | Conversion invalida a un `enum` |
| `0x22` | Storage con codificacion incorrecta |
| `0x31` | `pop()` en un array vacio |
| `0x32` | Indice fuera de rango |
| `0x41` | Demasiada memoria reservada |
| `0x51` | Llamada a una funcion interna sin inicializar |

Un panic suele indicar un **bug**, no una condicion normal de negocio. Por eso el codigo `0x12` de `dividir(10, 0)` es lo que verifica el test.

### `catch (bytes memory)`

Atrapa cualquier otra cosa, incluidos los **errores personalizados**. Los datos empiezan con el selector del error, y asi lo identificas:

```solidity
} catch (bytes memory datos) {
    return (false, bytes4(datos) == Riesgoso.SaldoInsuficiente.selector);
}
```

Con `bytes4(datos)` tomas los primeros 4 bytes. Si necesitas tambien los argumentos (`pedido`, `disponible`), los decodificas con `abi.decode` sobre el resto de los bytes.

Consejo: `catch Error(...)` no atrapa errores personalizados. Si tu destino usa errores personalizados, necesitas `catch (bytes memory)`.

## `try new`: fallos en el constructor

```solidity
function crearFragil(uint256 valor) external returns (address creado, string memory razon) {
    try new Fragil(valor) returns (Fragil nuevo) {
        return (address(nuevo), "");
    } catch Error(string memory mensaje) {
        return (address(0), mensaje);
    }
}
```

Si el constructor de `Fragil` revierte (`valor == 0`), el fallo se atrapa y el contrato principal sigue funcionando. Util para fabricas que crean muchos contratos y no quieren que uno defectuoso rompa todo.

## Cuando usar `try/catch`

Buenos casos:

- Llamar a contratos externos que **no controlas** y que pueden fallar sin que eso deba detener todo (por ejemplo, intentar leer un oraculo y usar un precio de respaldo).
- Procesar una lista de operaciones y seguir aunque una falle.
- Fabricas que despliegan contratos.

Malos casos:

- Para ocultar errores. Un `catch {}` vacio hace que los fallos pasen sin que nadie los note.
- Con contratos tuyos donde puedes evitar el fallo con una comprobacion previa.

## Ver el fallo desde TypeScript

En el test, las funciones `view` se llaman con `read`, y devuelven una tupla como array:

```ts
assert.deepEqual(await contrato.read.probarRequire([0n]), [false, "x debe ser mayor a cero"]);
assert.deepEqual(await contrato.read.probarDivision([10n, 0n]), [false, 0x12n]);
```

Y para el caso **sin** `try/catch`, el error llega directo al llamador:

```ts
await viem.assertions.revertWith(riesgoso.read.exigirPositivo([0n]), "x debe ser mayor a cero");
await viem.assertions.revertWithCustomError(riesgoso.read.retirar([11n]), riesgoso, "SaldoInsuficiente");
```

## Ejecutar el test

```bash
npx hardhat test test/11-TryCatch.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-TryCatch.ts --network hardhatMainnet
```

`TryCatch` crea su propio `Riesgoso` en el constructor, asi que solo hay que desplegar un contrato.

## Errores comunes

### `Try can only be used with external function calls and contract creation calls`

Intentas usar `try` con una funcion interna o con `this.` mal usado. Solo sirve con llamadas externas.

### Atrapar y no hacer nada

Un `catch {}` vacio traga el error. Como minimo, emite un evento.

### Esperar que `catch Error` atrape un error personalizado

No lo hace. Usa `catch (bytes memory)` y compara el selector.

## Ejercicios

1. Agrega un `catch (bytes memory)` a `probarRequire` y comprueba que sigue devolviendo el mensaje del `require`.
2. Escribe una funcion que llame a `dividir` con una lista de pares y devuelva cuantas divisiones fallaron.
3. Decodifica los argumentos de `SaldoInsuficiente` dentro del `catch (bytes memory)`.

## Resumen

- `try/catch` atrapa fallos de llamadas **externas** y de `new`.
- `catch Error(string)` para `require/revert` con mensaje, `catch Panic(uint256)` para errores del compilador, `catch (bytes)` para el resto.
- Los errores personalizados se identifican por su selector (primeros 4 bytes).
- No sirve para funciones internas y no atrapa errores de decodificacion en el llamador.
