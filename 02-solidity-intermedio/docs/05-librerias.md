# 05 - Librerias

Una libreria es un contrato especial que agrupa **funciones reutilizables sin estado propio**. Sirve para no repetir codigo entre contratos.

Archivos de esta leccion:

- `contracts/05-Librerias.sol`
- `test/05-Librerias.ts`
- `ignition/modules/05-Librerias.ts`
- `scripts/deploy-Librerias.ts`

## Definir una libreria

```solidity
library MathLib {
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }
}
```

Diferencias con un contrato normal:

- No tiene variables de estado propias.
- No se puede heredar de ella ni ella hereda.
- No puede recibir ETH.
- No tiene constructor.

## Funciones `internal` vs `external`/`public`

Esto decide **como** se usa la libreria:

| Tipo de funcion | Que pasa al compilar | Hace falta desplegar la libreria |
| --- | --- | --- |
| `internal` | El codigo se **copia dentro** del contrato que la usa | No |
| `public` / `external` | El contrato la llama con `delegatecall` a una direccion | Si, y hay que **enlazarla** (linking) |

En este modulo todas las funciones son `internal`, que es lo mas comun y lo mas simple: nada que desplegar aparte. Por eso el modulo de Ignition solo despliega `Estadisticas`.

Las librerias con funciones `public`/`external` se usan cuando el codigo compartido es grande y quieres ahorrar tamano de bytecode. Requieren pasar las direcciones de las librerias al desplegar; lo veras en modulos avanzados.

## `using X for Y`

Permite llamar las funciones de una libreria como si fueran metodos del tipo:

```solidity
contract Estadisticas {
    using MathLib for uint256;

    function mayorDe(uint256 a, uint256 b) external pure returns (uint256) {
        return a.max(b);   // equivale a MathLib.max(a, b)
    }
}
```

El primer parametro de la funcion recibe el valor sobre el que se llama. Tambien puedes llamarla directamente como `MathLib.promedio(valores)`, como hace `promedioDe`.

## Librerias sobre storage

Una libreria no tiene storage propio, pero **puede operar sobre el storage del contrato que la usa** recibiendo una referencia `storage`:

```solidity
library ArrayLib {
    function sumar(uint256[] storage self) internal view returns (uint256 total) {
        for (uint256 i = 0; i < self.length; i++) {
            total += self[i];
        }
    }

    function quitar(uint256[] storage self, uint256 indice) internal {
        require(indice < self.length, "Indice fuera de rango");
        self[indice] = self[self.length - 1];
        self.pop();
    }
}

contract Estadisticas {
    using ArrayLib for uint256[];
    uint256[] public datos;

    function total() external view returns (uint256) {
        return datos.sumar();
    }
}
```

Convencion: al primer parametro se le llama `self`. `datos.sumar()` pasa la referencia al array real, no una copia. Es la misma diferencia `storage` vs `memory` que ves en la leccion 08.

### El patron "swap and pop"

`quitar` no conserva el orden: copia el ultimo elemento en el hueco y hace `pop()`. Es muy barato en gas (no hay que desplazar elementos). Es ideal cuando el orden no importa. En el test, al quitar el indice `0` de `[1, 2, 3]` queda `[3, 2]`.

## Porcentajes en puntos base

`MathLib.porcentaje` usa **puntos base (bps)** porque Solidity no tiene decimales:

```text
100 bps    = 1%
250 bps    = 2.5%
10_000 bps = 100%
```

```solidity
return (valor * bps) / 10_000;
```

Multiplica primero y divide despues, para no perder precision con la division entera.

## Cuando usar una libreria

- Utilidades matematicas (`min`, `max`, raiz cuadrada, promedios).
- Manipulacion de arrays, strings o bytes.
- Logica de validacion que repites en varios contratos.

OpenZeppelin trae varias: `Math`, `SafeCast`, `Strings`, `Address`, `EnumerableSet`. Antes de escribir una utilidad, revisa si ya existe alli.

## Ejecutar el test

```bash
npx hardhat test test/05-Librerias.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-Librerias.ts --network hardhatMainnet
```

## Errores comunes

### `Library "X" not linked`

Usas funciones `public`/`external` de una libreria y no enlazaste su direccion al desplegar.

### Confundir la libreria con estado

Una libreria no puede tener `uint256 public total`. Si necesitas estado, hazlo un contrato.

### Olvidar `using ... for ...`

Sin esa linea, `a.max(b)` no compila; hay que llamar `MathLib.max(a, b)`.

## Ejercicios

1. Agrega `MathLib.sumar` con proteccion contra overflow usando `unchecked` y compara.
2. Agrega `ArrayLib.maximo(uint256[] storage self)`.
3. Escribe una libreria `StringLib` con una funcion que compare dos strings usando `keccak256`.

## Resumen

- Una libreria agrupa funciones sin estado propio.
- Con funciones `internal`, el codigo se incluye en el contrato y no se despliega aparte.
- `using L for T` permite llamar funciones como metodos.
- Una libreria puede operar sobre el storage del contrato con parametros `storage`.
