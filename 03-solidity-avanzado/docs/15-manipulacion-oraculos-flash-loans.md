# 15 - Manipulacion de oraculos y flash loans

Esta es la leccion mas compleja del modulo, porque combina varias piezas que ya construiste: un AMM simple, un prestamo sin garantia que se paga en la misma transaccion, y el problema de confiar en el precio equivocado. Es tambien la que mas se parece a los exploits reales mas costosos de la historia de DeFi.

Archivos de esta leccion:

- `contracts/15-ManipulacionOraculo.sol`
- `test/15-ManipulacionOraculo.ts`
- `ignition/modules/15-ManipulacionOraculo.ts`
- `scripts/deploy-ManipulacionOraculo.ts`

## Repaso: por que esto conecta con el modulo 02

En el modulo 02 (leccion 16) aprendiste a validar un oraculo: que el precio sea positivo, que no este obsoleto. Esas validaciones protegen contra un oraculo que **falla o se congela**. Esta leccion ataca un problema distinto: un "oraculo" que funciona perfectamente bien, pero cuya fuente de precio es **manipulable dentro de la misma transaccion**.

## Un AMM minimo, y su precio "spot"

```solidity
function precioSpotAenB() public view returns (uint256) {
    return (reservaB * 1e18) / reservaA;
}

function swapBporA(uint256 montoB) external returns (uint256 montoA) {
    montoA = (reservaA * montoB) / (reservaB + montoB);
    reservaB += montoB;
    reservaA -= montoA;
    tokenA.transfer(msg.sender, montoA);
}
```

Formula `x * y = k` (constante), sin comision para simplificar los numeros. El precio "spot" es simplemente la relacion ACTUAL entre las reservas. Cada swap cambia esa relacion: comprar A con B sube el precio de A (hay menos A en la pool, mas B).

**El punto clave:** el precio spot de un pool con poca liquidez se puede mover MUCHO con un solo swap grande. Si alguien mas usa ese precio spot como referencia de valor, y vos podes moverlo justo antes de que lo consulten, tenes una ventaja.

## Flash loans: capital sin garantia, por una transaccion

```solidity
function flashLoan(uint256 monto, bytes calldata datos) external {
    uint256 saldoAntes = token.balanceOf(address(this));
    token.transfer(msg.sender, monto);

    IReceptorFlashLoan(msg.sender).ejecutarOperacion(token, monto, comision, datos);

    uint256 saldoDespues = token.balanceOf(address(this));
    require(saldoDespues >= saldoAntes + comision, "Prestamo no devuelto con su comision");
}
```

Un flash loan presta CUALQUIER monto, sin ninguna garantia, con una unica condicion: que se devuelva (con una comision) antes de que la funcion `flashLoan` termine de ejecutarse. Si no se devuelve, el `require` final revierte TODA la transaccion, incluido el envio del prestamo: es como si nunca hubiera pasado.

Esto significa que el proveedor del flash loan **nunca corre riesgo**. Lo que si habilita es que alguien mueva mucho mas capital del que tiene, durante el tiempo (en la practica, unas pocas instrucciones) que dura esa unica transaccion.

## El consumidor vulnerable

```solidity
function depositarYPrestar(uint256 montoColateral) external returns (uint256 prestado) {
    tokenA.transferFrom(msg.sender, address(this), montoColateral);
    prestado = (montoColateral * pool.precioSpotAenB()) / 1e18;
    tokenB.transfer(msg.sender, prestado);
}
```

Este contrato acepta tokenA como "colateral" y entrega tokenB a cambio, valuando el colateral al precio SPOT de la pool, EN ESE MISMO INSTANTE, sin ninguna validacion de si ese precio es razonable o estable.

## El ataque, paso a paso

```solidity
function ejecutarOperacion(TokenDePrueba token, uint256 monto, uint256 comision, bytes calldata) external {
    // 1. Compra tokenA con TODO el prestamo: empuja fuerte el precio de A hacia arriba.
    token.approve(address(pool), monto);
    uint256 aComprado = pool.swapBporA(monto);

    // 2. "Vende" ese tokenA al consumidor, que lo valua al precio YA INFLADO.
    tokenA.approve(address(consumidor), aComprado);
    consumidor.depositarYPrestar(aComprado);

    // 3. Devuelve el flash loan con su comision. Lo que sobra es ganancia neta.
    token.transfer(address(proveedor), monto + comision);
}
```

No hace falta "deshacer" el swap contra la pool. La ganancia no viene de la pool: viene de venderle el tokenA (comprado a un precio PROMEDIO, con slippage) al consumidor, que paga el precio MARGINAL, mas alto, del punto donde quedo la pool despues de la compra. En cualquier curva de precio convexa como `x*y=k`, el precio promedio pagado en una compra es siempre MENOR que el precio marginal resultante: ahi esta el margen que el atacante se queda.

```ts
console.log(await tokenB.read.balanceOf([atacante.address])); // 0, antes de atacar

await atacante.write.atacar([5_000n]);

const ganancia = await atacante.read.gananciaEnB();
// > 0, sin haber puesto NADA de capital propio
```

En una corrida real de esta leccion, con una pool de 10 000/10 000 y un prestamo de 5000: el atacante compra ~3333 unidades de tokenA (pagando en promedio 1.5 tokenB por cada uno), pero el precio SPOT resultante es ~2.25 tokenB por tokenA. Vendiendole esos 3333 al consumidor a ese precio inflado le da ~7499 tokenB. Paga el prestamo (5000 + comision de 0.3%), y le queda una ganancia neta de mas de 2000 tokenB, sin haber arriesgado un centavo propio.

## La correccion: un precio que no se puede mover en la misma transaccion

```solidity
contract ConsumidorOraculoSeguro is IConsumidorPrestamos {
    uint256 public precioAenB; // fijado por una fuente SEPARADA

    function actualizarPrecio(uint256 nuevoPrecio) external {
        require(msg.sender == admin, "No autorizado");
        precioAenB = nuevoPrecio;
    }

    function depositarYPrestar(uint256 montoColateral) external returns (uint256 prestado) {
        tokenA.transferFrom(msg.sender, address(this), montoColateral);
        prestado = (montoColateral * precioAenB) / 1e18;
        tokenB.transfer(msg.sender, prestado);
    }
}
```

Este consumidor no lee la pool para nada: usa un precio fijado por un proceso separado (en un caso real, un oraculo como el del modulo 02, con multiples fuentes y actualizaciones espaciadas en el tiempo). Repetir exactamente el mismo ataque contra esta version:

```ts
// Comprar caro en la pool (por el slippage) y vender al mismo precio de
// siempre deja PERDIDA, no ganancia: el atacante ni siquiera junta lo
// suficiente para devolver el flash loan, y la transaccion entera revierte.
await viem.assertions.revert(atacante.write.atacar([5_000n]));
```

El resultado es incluso mas contundente de lo que parece a primera vista: como el precio de venta al consumidor ya no esta inflado, el atacante paga MAS por el tokenA (por el slippage de la pool) de lo que recupera al "venderselo" al consumidor al precio de siempre. Ni siquiera junta lo necesario para devolver el flash loan, y la transaccion COMPLETA revierte: el ataque no solo no genera ganancia, no logra ejecutarse en absoluto.

## La leccion de fondo

**Nunca uses el precio spot de un unico pool con poca liquidez como fuente de verdad para decisiones de valor**, especialmente si ese pool se puede mover con capital que alguien puede conseguir temporalmente (via flash loans o simplemente porque tiene mucho capital). Las defensas reales en produccion incluyen:

- **Oraculos externos y confiables** (como Chainlink, modulo 02 leccion 16), actualizados por un proceso separado de cualquier transaccion individual.
- **TWAP (Time-Weighted Average Price)**: un precio promediado durante una ventana de tiempo (varios bloques), que un solo swap dentro de un bloque no puede mover significativamente.
- **Multiples fuentes de precio**, comparadas entre si, rechazando o alertando si difieren demasiado.

## Ejecutar el test

```bash
npx hardhat test test/15-ManipulacionOraculo.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ManipulacionOraculo.ts --network hardhatMainnet
```

## Errores comunes

### Pensar que un flash loan es "el ataque"

El flash loan es solo la HERRAMIENTA que permite mover mucho capital sin tenerlo. El ataque real es la manipulacion del precio y la confianza ciega de un tercero en ese precio. Un atacante con capital propio suficiente podria hacer lo mismo sin ningun flash loan; el flash loan solo baja la barrera de entrada.

### Confundir "pool con mucha liquidez" con "pool segura"

Mas liquidez hace mas caro mover el precio, pero no lo hace imposible: con suficiente capital (via flash loans, que no tienen limite mas alla de la liquidez del propio prestamista), cualquier pool se puede mover. La defensa real no es "mas liquidez", es "no usar el precio spot de un solo pool como fuente de verdad".

### Usar el precio spot "porque es simple" en un prototipo, y olvidarse de cambiarlo

Muchos incidentes reales empezaron como una simplificacion "temporal" en una version de prueba que nunca se corrigio antes de produccion.

## Ejercicios

1. Calcula, para distintos tamanos de prestamo (2000, 5000, 8000), como cambia la ganancia del atacante, y explica por que no crece de forma lineal.
2. Agrega una comision a la pool (por ejemplo, 0.3% en cada swap) y observa como afecta la rentabilidad del ataque.
3. Implementa una version simplificada de TWAP: un precio promedio de las ultimas N lecturas de `precioSpotAenB()`, guardadas en un array, y demuestra que un solo swap grande no lo mueve tanto como al precio spot puro.

## Resumen

- El precio "spot" de un AMM es la relacion actual entre sus reservas, y un swap grande lo puede mover fuertemente si la pool tiene poca liquidez.
- Un flash loan presta capital sin garantia, a condicion de devolverlo (con comision) en la misma transaccion; nunca arriesga al prestamista.
- El ataque clasico: mover el precio de un pool con un flash loan, y venderle a un consumidor que confia ciegamente en ese precio ya manipulado.
- La defensa es usar una fuente de precio que no se pueda mover dentro de una sola transaccion: oraculos externos, TWAP, o multiples fuentes comparadas entre si.
