# 04 - Interfaces

Una interfaz describe **que** puede hacer un contrato sin decir **como**. Es el "enchufe" que permite que contratos escritos por personas distintas se hablen entre si.

Archivos de esta leccion:

- `contracts/04-Interfaces.sol`
- `test/04-Interfaces.ts`
- `ignition/modules/04-Interfaces.ts`
- `scripts/deploy-Interfaces.ts`

## Definir una interfaz

```solidity
interface IAlmacen {
    event Guardado(address indexed por, uint256 valor);

    function guardar(uint256 valor) external;
    function obtener() external view returns (uint256);
}
```

Reglas de una interfaz:

- Todas las funciones son `external` y sin cuerpo.
- No tiene variables de estado ni constructor.
- Puede declarar eventos, errores y structs.
- Puede heredar de otras interfaces.

Por convencion su nombre empieza con `I`: `IAlmacen`, `IERC20`, `IERC721`.

## Implementar una interfaz

```solidity
contract AlmacenSimple is IAlmacen {
    uint256 private _valor;

    function guardar(uint256 valor) external {
        _valor = valor;
        emit Guardado(msg.sender, valor);
    }

    function obtener() external view returns (uint256) {
        return _valor;
    }
}
```

Desde Solidity 0.8.8 no hace falta escribir `override` al implementar funciones de una interfaz.

El compilador te obliga a implementar **todas** las funciones. Si falta alguna, el contrato se considera abstracto.

## Distintas implementaciones, una sola interfaz

`AlmacenDoble` implementa la misma interfaz con otro comportamiento (guarda el doble). Para quien lo usa, ambos son "un `IAlmacen`":

```solidity
contract ClienteAlmacen {
    function guardarEn(address almacen, uint256 valor) external {
        IAlmacen(almacen).guardar(valor);
    }

    function leerDe(address almacen) external view returns (uint256) {
        return IAlmacen(almacen).obtener();
    }
}
```

`IAlmacen(almacen)` no crea nada: le dice al compilador "en esta direccion hay un contrato que cumple `IAlmacen`" y genera la llamada correcta. Es el mecanismo con el que tu contrato habla con **cualquier** token ERC-20, con un oraculo o con otro protocolo, sin conocer su codigo fuente.

Esto es lo que permite que un intercambio como Uniswap acepte cualquier token ERC-20: solo conoce `IERC20`.

## Cuidado: la direccion no se verifica

Convertir una direccion a una interfaz **no comprueba** que ahi haya un contrato ni que cumpla la interfaz:

- Si la direccion es una cuenta normal (sin codigo), la llamada revierte al intentar leer el resultado.
- Si es otro contrato que no tiene esa funcion, revierte.
- Si es un contrato malicioso que implementa la interfaz con trampa, hace lo que quiera.

Una interfaz garantiza la **forma** de la llamada, no la **confianza** en el destino. Aplica esto siempre que recibas una direccion de un usuario.

## `interfaceId` y ERC-165

```solidity
function idInterfaz() external pure returns (bytes4) {
    return type(IAlmacen).interfaceId;
}
```

`type(I).interfaceId` es el **XOR de los selectores** de todas las funciones de la interfaz (sin contar las heredadas). El test lo comprueba:

```ts
const selectorGuardar = BigInt(toFunctionSelector("guardar(uint256)"));
const selectorObtener = BigInt(toFunctionSelector("obtener()"));
const esperado = toHex(selectorGuardar ^ selectorObtener, { size: 4 });
```

Con esto se construye ERC-165 ("supportsInterface"), el estandar que permite preguntar a un contrato "soportas esta interfaz?". Lo veras en la leccion 15 con los NFTs.

## Interfaces y el ABI

El **ABI** es la descripcion en JSON de las funciones y eventos de un contrato. Una interfaz de Solidity es lo mismo pero en codigo: por eso muchos proyectos publican solo sus interfaces (`IUniswapV3Pool`, `IERC20`) para que otros integren sin copiar todo el codigo.

## Ejecutar el test

```bash
npx hardhat test test/04-Interfaces.ts
```

Comprueba que:

- `AlmacenSimple` guarda el valor tal cual y `AlmacenDoble` el doble.
- El evento definido en la interfaz se emite con los argumentos correctos.
- El mismo `ClienteAlmacen` funciona con ambas implementaciones.
- `interfaceId` coincide con el XOR de los selectores.

## Desplegar

```bash
npx hardhat run scripts/deploy-Interfaces.ts --network hardhatMainnet
```

## Errores comunes

### `Functions in interfaces must be declared external`

Cambia `public` por `external`.

### `Contract "X" should be marked as abstract`

Te falta implementar alguna funcion de la interfaz.

### Firma distinta a la de la interfaz

Si cambias un tipo (`uint` por `uint256` funciona porque son iguales, pero `uint128` no), la funcion ya no coincide con la interfaz.

## Ejercicios

1. Crea `AlmacenConLimite is IAlmacen` que rechace valores mayores a 100.
2. Agrega una funcion `borrar()` a `IAlmacen` y arregla los contratos que dejan de compilar.
3. Calcula a mano el nuevo `interfaceId` y actualiza el test.

## Resumen

- Una interfaz define funciones `external` sin cuerpo, sin estado ni constructor.
- Permite hablar con cualquier contrato que la cumpla sin conocer su codigo.
- `IContrato(direccion)` genera la llamada, pero no valida ni confia en el destino.
- `interfaceId` (XOR de selectores) es la base de ERC-165.
