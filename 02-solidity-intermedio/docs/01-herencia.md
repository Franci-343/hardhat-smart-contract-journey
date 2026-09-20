# 01 - Herencia

La herencia permite que un contrato **reutilice y extienda** el codigo de otro. El contrato que hereda se llama *hijo* y el que se hereda, *padre*.

Archivos de esta leccion:

- `contracts/01-Herencia.sol`
- `test/01-Herencia.ts`
- `ignition/modules/01-Herencia.ts`
- `scripts/deploy-Herencia.ts`

## Sintaxis basica

Se usa la palabra `is`:

```solidity
contract Animal {
    string public especie = "Animal";
}

contract Perro is Animal {
    // Perro ya tiene `especie` y todo lo demas de Animal.
}
```

Al desplegar `Perro`, el resultado es **un solo contrato** que contiene el codigo de ambos. No existe un contrato `Animal` separado en la blockchain: la herencia se resuelve al compilar.

## `virtual` y `override`

Un hijo solo puede reemplazar una funcion del padre si el padre la marco como `virtual`. Y el hijo debe declarar que la reemplaza con `override`:

```solidity
contract Animal {
    function sonido() public pure virtual returns (string memory) {
        return "...";
    }
}

contract Perro is Animal {
    function sonido() public pure virtual override returns (string memory) {
        return "Guau";
    }
}
```

- `virtual`: "mis hijos pueden cambiar esta funcion".
- `override`: "estoy cambiando la funcion de mi padre".
- `virtual override` juntos: "cambio la del padre y permito que mis hijos me cambien a mi".

Si olvidas alguna de las dos palabras, el compilador da error. Es una proteccion: nadie reemplaza una funcion por accidente.

## Polimorfismo

Mira `presentarse()` en `Animal`:

```solidity
function presentarse() public view returns (string memory) {
    return string.concat(especie, " dice: ", sonido());
}
```

Esta funcion vive en el padre, pero llama a `sonido()`. Si el contrato desplegado es un `Perro`, se ejecuta el `sonido()` de `Perro`:

```text
Animal.presentarse()  -> "Animal dice: ..."
Perro.presentarse()   -> "Perro dice: Guau"
```

El padre define el esqueleto y cada hijo rellena los detalles.

## Herencia de varios niveles

```text
Animal -> Perro -> Cachorro
```

`Cachorro` hereda de `Perro`, que hereda de `Animal`. Recibe todo lo de ambos. Para poder sobrescribir `sonido()` en `Cachorro`, `Perro` lo marco `virtual override`.

## Herencia multiple

Un contrato puede heredar de varios padres:

```solidity
contract Pato is Volador, Nadador { ... }
```

Si dos padres definen la **misma funcion**, el hijo esta obligado a sobrescribirla e indicar de cuales padres viene:

```solidity
function moverse() public pure override(Volador, Nadador) returns (string memory) {
    return string.concat(Volador.moverse(), " y ", Nadador.moverse());
}
```

Sin esto el compilador no sabria cual version usar (el famoso "problema del diamante"). Ademas, se puede llamar a la version de un padre concreto con `Padre.funcion()`.

### Orden de herencia

Con herencia multiple, el orden importa: se escribe **del mas general al mas especifico**.

```solidity
contract A {}
contract B is A {}
contract C is A, B {}   // correcto
contract D is B, A {}   // error de linearizacion
```

Solidity usa el algoritmo C3 para linearizar los padres. Si el orden es imposible, no compila.

## Visibilidad y herencia

| Visibilidad | Lo ve el hijo? |
| --- | --- |
| `public` | Si |
| `internal` | Si |
| `external` | Solo desde fuera del contrato |
| `private` | No |

Por eso los helpers pensados para los hijos suelen ser `internal` (por ejemplo `_registrar` en la leccion 02).

## Para que sirve en la practica

- Compartir logica comun (propiedad, pausas, roles) entre varios contratos.
- Extender un contrato ya existente sin copiar y pegar.
- Dividir un contrato grande en piezas pequenas.

Aviso: la herencia **no es gratis**. Todo el codigo heredado acaba en un solo contrato, que tiene un limite de tamano (24 KB). Heredar demasiado tambien vuelve el codigo dificil de seguir. Usa herencia cuando exista una relacion "es un tipo de", no solo para ahorrar lineas.

## Ejecutar el test

```bash
npx hardhat test test/01-Herencia.ts
```

Que comprueba:

- Que `Perro` usa su propio `sonido()`.
- Que `presentarse()` del padre usa el `sonido()` del hijo.
- Que `Cachorro` funciona con dos niveles de herencia.
- Que `Pato` combina dos padres con `override(Volador, Nadador)`.

## Desplegar

```bash
npx hardhat run scripts/deploy-Herencia.ts --network hardhatMainnet
npx hardhat ignition deploy ignition/modules/01-Herencia.ts --network hardhatMainnet
```

## Errores comunes

### `Overriding function is missing "override" specifier`

Sobrescribes una funcion del padre sin escribir `override`.

### `Trying to override non-virtual function`

El padre no marco la funcion como `virtual`.

### `Derived contract must override function "x". Two or more base classes define function with same name`

Herencia multiple con funciones repetidas: escribe `override(A, B)`.

## Ejercicios

1. Crea un contrato `Gato is Animal` que responda `"Miau"` y agrega un test.
2. Crea un contrato `Ave is Volador` y comprueba que `moverse()` devuelve `"Vuela"`.
3. Quita `virtual` de `Perro.sonido()` y lee el error que aparece al compilar `Cachorro`.

## Resumen

- `is` para heredar, `virtual` para permitir cambios, `override` para cambiarlos.
- Las funciones del padre pueden llamar a la version del hijo (polimorfismo).
- Con varios padres y funciones repetidas hay que usar `override(A, B)`.
- Todo se compila en un unico contrato desplegado.
