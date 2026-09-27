# 08 - Introduccion a Assembly / Yul

Assembly (en Solidity, el dialecto se llama Yul) da acceso directo a los opcodes de la EVM, sin las protecciones ni el azucar sintactico de Solidity normal. Esta leccion muestra donde tiene sentido usarlo, con sus equivalentes en Solidity normal al lado para comparar.

Archivos de esta leccion:

- `contracts/08-AssemblyYul.sol`
- `test/08-AssemblyYul.ts`
- `ignition/modules/08-AssemblyYul.ts`
- `scripts/deploy-AssemblyYul.ts`

## La regla de oro: no usar assembly "porque se puede"

Assembly no tiene las protecciones de Solidity: sin chequeos de tipo, sin proteccion automatica de overflow (leccion 03), sin los limites de acceso que Solidity impone. Cada linea de assembly es una linea que un auditor tiene que revisar con mas cuidado. Usalo solo cuando Solidity normal no alcanza, o cuando el ahorro de gas es significativo y podes demostrar que el codigo es correcto.

## Leer un slot de storage

```solidity
uint256 public valorGuardado = 777;

function leerConAssembly() external view returns (uint256 resultado) {
    assembly {
        resultado := sload(valorGuardado.slot)
    }
}
```

`valorGuardado.slot` es un **accesor especial**, disponible dentro de bloques `assembly`, que le pregunta al COMPILADOR en que slot vive esa variable. No hace falta adivinar ni escribir el numero a mano (y si el compilador reordena o agrega variables mas adelante, `valorGuardado.slot` se actualiza solo).

`sload` es el opcode que lee un slot de storage. Con Solidity normal, `return valorGuardado;` hace exactamente lo mismo, mas simple:

```solidity
function leerNormal() external view returns (uint256) {
    return valorGuardado;
}
```

Este primer ejemplo no tiene ninguna ventaja practica sobre la version normal: esta aca para mostrar el mecanismo (`sload` + `.slot`) antes de usarlo en algo mas util.

## Sumar un array desde calldata

```solidity
function sumarConAssembly(uint256[] calldata datos) external pure returns (uint256 total) {
    assembly {
        let len := datos.length
        let ptr := datos.offset

        for { let i := 0 } lt(i, len) { i := add(i, 1) } {
            total := add(total, calldataload(add(ptr, mul(i, 0x20))))
        }
    }
}
```

`datos.offset` y `datos.length` son los mismos accesores especiales, esta vez para un parametro `calldata`: te dan la posicion y el largo del array dentro de los datos de la transaccion, sin que tengas que calcular manualmente el layout de codificacion ABI (offset de 32 bytes para el puntero, luego el largo, luego los elementos). `calldataload` lee 32 bytes crudos desde una posicion de calldata.

La version normal:

```solidity
function sumarNormal(uint256[] calldata datos) external pure returns (uint256 total) {
    uint256 longitud = datos.length;
    for (uint256 i = 0; i < longitud; i++) {
        total += datos[i];
    }
}
```

Ambas dan el mismo resultado (el test lo confirma comparando las dos). La version en assembly evita algunas verificaciones que Solidity agrega automaticamente (como el chequeo de limites al indexar `datos[i]`), lo que puede ahorrar gas en loops muy grandes y muy frecuentes, a cambio de que SOS VOS quien tiene que garantizar que el codigo no se sale de los limites.

## Saber si una direccion es un contrato

```solidity
function esContratoConAssembly(address cuenta) external view returns (bool resultado) {
    assembly {
        resultado := gt(extcodesize(cuenta), 0)
    }
}
```

`extcodesize` es el opcode que devuelve cuantos bytes de codigo tiene una direccion. Antes de que Solidity expusiera `direccion.code.length`, esta era la UNICA forma de hacer esta pregunta. Hoy:

```solidity
function esContratoNormal(address cuenta) external view returns (bool) {
    return cuenta.code.length > 0;
}
```

hace exactamente lo mismo, sin assembly. Este ejemplo esta aca a proposito: muestra un caso donde assembly **ya no es necesario**, porque Solidity fue agregando accesores de alto nivel para varios de los usos mas comunes de assembly de hace unos anos. Antes de escribir assembly para algo, vale la pena revisar si ya existe un equivalente normal.

## Cuando SI vale la pena usar assembly

- **Proxies** (lecciones 10 y 11): el `fallback()` que reenvia CUALQUIER llamada con `delegatecall` necesita `calldatacopy`, `returndatacopy` y manejo directo de memoria; no hay forma de expresar eso en Solidity normal.
- **Clones minimos** (leccion 12): construir bytecode de creacion a mano.
- **Leer slots "raros"** (como los de EIP-1967 en las lecciones 10 y 11): storage en una posicion que no corresponde a ninguna variable declarada.
- Optimizaciones de gas muy especificas, en codigo que se ejecuta con muchisima frecuencia, DESPUES de medir que el ahorro es real y significativo.

Fuera de esos casos, Solidity normal es mas seguro y mas facil de auditar.

## Ejecutar el test

```bash
npx hardhat test test/08-AssemblyYul.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-AssemblyYul.ts --network hardhatMainnet
```

## Errores comunes

### Escribir assembly sin un equivalente para comparar

Siempre que escribas una funcion en assembly con una razon de peso, considera escribir tambien la version normal (aunque sea solo para tests) y comparar resultados. Es la forma mas simple de detectar un error de logica en el assembly.

### Salirse de los limites de un array sin que Solidity te avise

En Solidity normal, `datos[i]` con `i >= datos.length` revierte solo. En assembly, `calldataload` en una posicion fuera de rango simplemente lee CEROS (o basura, dependiendo del contexto) sin avisar. Es responsabilidad tuya validar los limites antes.

### Copiar snippets de assembly de internet sin entenderlos

Un fragmento de assembly que funciona en un contexto (por ejemplo, dentro de un `fallback()`) puede comportarse distinto en otro. No copies y pegues assembly sin entender cada opcode.

## Ejercicios

1. Escribe una funcion en assembly que devuelva el `balance` de una direccion usando el opcode `balance`, y comparala con `address(cuenta).balance` en Solidity normal.
2. Escribe una funcion `maximoConAssembly(uint256 a, uint256 b)` usando `gt` y `iszero` en vez de un `if`/ternario de Solidity.
3. Mide el gas de `sumarConAssembly` contra `sumarNormal` con arrays de 5, 50 y 200 elementos, y grafica (a mano, con los numeros) como crece la diferencia.

## Resumen

- Assembly (Yul) da acceso directo a los opcodes de la EVM, sin las protecciones de Solidity.
- Los accesores especiales (`.slot`, `.offset`, `.length`) evitan tener que calcular manualmente posiciones de storage o de calldata.
- Antes de escribir algo en assembly, revisa si Solidity ya expone un equivalente de alto nivel (como `.code.length` en vez de `extcodesize`).
- Reservalo para lo que Solidity no puede expresar (proxies, clones) o para optimizaciones medidas y justificadas.
