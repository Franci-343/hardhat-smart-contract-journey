# 03 - Contratos abstractos

Un contrato abstracto es una **plantilla incompleta**. Define parte del comportamiento y obliga a los hijos a completar el resto.

Archivos de esta leccion:

- `contracts/03-ContratosAbstractos.sol`
- `test/03-ContratosAbstractos.ts`
- `ignition/modules/03-ContratosAbstractos.ts`
- `scripts/deploy-ContratosAbstractos.ts`

## Cuando un contrato es abstracto

Un contrato es abstracto cuando **al menos una funcion no tiene implementacion**. Se declara con la palabra `abstract`:

```solidity
abstract contract Figura {
    // Sin cuerpo: los hijos deben implementarlas.
    function area() public view virtual returns (uint256);
    function perimetro() public view virtual returns (uint256);
}
```

Reglas:

- Las funciones sin cuerpo terminan en `;` y deben ser `virtual`.
- Un contrato abstracto **no se puede desplegar**. Solo se despliegan sus hijos.
- El hijo que quiera ser desplegable debe implementar **todas** las funciones pendientes. Si deja alguna sin implementar, el hijo tambien queda abstracto.

El test lo comprueba: el artefacto compilado de `Figura` no tiene bytecode (`"0x"`), no hay nada que desplegar.

## Un abstracto puede tener codigo real

No es una interfaz vacia. Puede tener estado, constructor y funciones completas:

```solidity
abstract contract Figura {
    string public nombre;

    constructor(string memory nombre_) {
        nombre = nombre_;
    }

    function areaSobrePerimetro() public view returns (uint256) {
        return area() / perimetro();   // usa las funciones abstractas
    }
}
```

Fijate en `areaSobrePerimetro()`: esta implementada en el padre pero usa `area()` y `perimetro()`, que cada hijo define a su manera. Se conoce como **patron template method**: el padre define el algoritmo y los hijos aportan las piezas.

## Implementar a los hijos

```solidity
contract Rectangulo is Figura {
    uint256 public ancho;
    uint256 public alto;

    constructor(uint256 ancho_, uint256 alto_) Figura("Rectangulo") {
        ancho = ancho_;
        alto = alto_;
    }

    function area() public view override returns (uint256) {
        return ancho * alto;
    }

    function perimetro() public view override returns (uint256) {
        return 2 * (ancho + alto);
    }
}
```

`Triangulo` implementa las mismas dos funciones con otra formula. Como ambas heredan de `Figura`, comparten `areaSobrePerimetro()` sin repetir codigo.

Dos detalles:

- El constructor del hijo pasa `"Rectangulo"` al constructor del padre (leccion 02).
- Al implementar una funcion abstracta se escribe `override`, aunque el padre no tenga cuerpo.

## Abstracto vs interfaz

| | Contrato abstracto | Interfaz |
| --- | --- | --- |
| Puede tener variables de estado | Si | No |
| Puede tener funciones implementadas | Si | No |
| Puede tener constructor | Si | No |
| Un contrato puede heredar de varios | Si | Si |
| Uso tipico | Base comun con logica compartida | Definir un "contrato de uso" |

Regla practica:

- Si solo quieres decir **que** funciones existen: interfaz (leccion 04).
- Si ademas quieres compartir **codigo o estado**: contrato abstracto.

OpenZeppelin usa muchos abstractos: `Ownable`, `Pausable` y `ERC20` son bases pensadas para heredar.

## Ejecutar el test

```bash
npx hardhat test test/03-ContratosAbstractos.ts
```

Con `Rectangulo(10, 10)` el test espera area `100`, perimetro `40` y `areaSobrePerimetro() = 2`. Con `Triangulo(6, 8, 10)`, area `24`, perimetro `24` y ratio `1`.

## Desplegar

Solo los hijos:

```bash
npx hardhat run scripts/deploy-ContratosAbstractos.ts --network hardhatMainnet
```

Si intentas hacer `viem.deployContract("Figura")` no funciona: no hay bytecode.

## Errores comunes

### `Contract "X" should be marked as abstract`

Heredas de un contrato con funciones sin implementar y no las implementaste. Implementalas o marca tu contrato como `abstract`.

### `Functions without implementation must be marked virtual`

Una funcion sin cuerpo necesita `virtual`.

### Olvidar `override` al implementar

Al implementar una funcion abstracta tambien hace falta `override`.

## Ejercicios

1. Agrega un `Cuadrado is Figura` con un solo parametro `lado`.
2. Agrega una tercera funcion abstracta `esGrande()` y observa como todos los hijos dejan de compilar hasta implementarla.
3. Escribe un contrato `Figura2` con una interfaz en lugar de un abstracto. Que pierdes?

## Resumen

- `abstract contract` = plantilla con al menos una funcion sin implementar.
- No se despliega: solo sus hijos completos.
- Puede combinar codigo real con piezas por definir (template method).
- Usa interfaz si solo necesitas describir; abstracto si tambien compartes logica o estado.
