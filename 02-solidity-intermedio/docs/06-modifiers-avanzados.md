# 06 - Modifiers avanzados

En el modulo 01 viste que un modifier es un fragmento de codigo que se ejecuta antes de una funcion. Aqui vas a ver todo lo que pueden hacer: recibir parametros, ejecutar codigo **despues** de la funcion, apilarse y proteger contra ataques.

Archivos de esta leccion:

- `contracts/06-ModifiersAvanzados.sol`
- `test/06-ModifiersAvanzados.ts`
- `ignition/modules/06-ModifiersAvanzados.ts`
- `scripts/deploy-ModifiersAvanzados.ts`

## Como funciona el `_`

El guion bajo `_;` marca el lugar donde se inserta el cuerpo de la funcion:

```solidity
modifier ejemplo() {
    // 1. codigo ANTES
    _;
    // 2. codigo DESPUES
}
```

Cuando llamas a una funcion con ese modifier, el orden es: codigo antes -> cuerpo de la funcion -> codigo despues.

## Modifier con parametros

```solidity
modifier valorMinimo(uint256 minimo) {
    if (msg.value < minimo) revert ValorInsuficiente(msg.value, minimo);
    _;
}

function depositar() external payable valorMinimo(0.01 ether) { ... }
```

El parametro se pasa al usarlo. Un mismo modifier sirve para varios umbrales distintos.

## Codigo antes y despues de `_`

El modifier `cooldown` limita cuantas veces puede actuar un usuario:

```solidity
modifier cooldown() {
    uint256 ultima = ultimaAccion[msg.sender];
    if (ultima != 0 && block.timestamp < ultima + COOLDOWN) {
        revert EnCooldown(ultima + COOLDOWN - block.timestamp);
    }
    _;
    ultimaAccion[msg.sender] = block.timestamp;   // se registra DESPUES de ejecutar
}
```

- Antes de `_`: comprueba que haya pasado el tiempo.
- Despues de `_`: anota la hora de esta accion.

El test usa `networkHelpers.time.increase(3600)` para avanzar una hora en la red simulada y comprobar que la accion vuelve a estar disponible.

## Apilar modifiers

```solidity
function accionConCooldown() external cooldown contarLlamada { ... }
```

Se ejecutan de **izquierda a derecha** y luego se "desenrollan" en orden inverso:

```text
cooldown (antes)
  contarLlamada (antes)      -> aqui no hay nada antes
    CUERPO DE LA FUNCION
  contarLlamada (despues)    -> llamadas++
cooldown (despues)           -> ultimaAccion = ahora
```

El orden puede cambiar el resultado. Un buen habito es poner primero los chequeos baratos y de autorizacion (`soloOwner`), luego los de estado y al final los que solo registran.

## Proteccion contra reentrada

La **reentrada** ocurre cuando un contrato al que envias ETH aprovecha para volver a llamar tu funcion antes de que termine la primera ejecucion.

```solidity
modifier noReentrante() {
    if (_bloqueado) revert Reentrada();
    _bloqueado = true;
    _;
    _bloqueado = false;
}
```

Mientras `retirar()` esta ejecutandose, `_bloqueado` es `true`. Cualquier intento de reentrar revierte.

El contrato `AtacanteReentrada` del archivo simula el ataque: al recibir ETH, su `receive()` llama otra vez a `retirar()`. El test comprueba que:

- El atacante solo recibe su propio deposito, una vez.
- El error capturado es exactamente `Reentrada()`.

```ts
assert.equal(await atacante.read.errorDeReentrada(), toFunctionSelector("Reentrada()"));
```

Ademas de `noReentrante`, `retirar()` sigue el patron **checks-effects-interactions**:

1. **Checks**: verificar condiciones (`if (monto == 0) revert`).
2. **Effects**: actualizar el estado (`saldos[msg.sender] = 0`).
3. **Interactions**: recien entonces enviar ETH (`call`).

Usa ambas defensas juntas: el patron ordena el codigo y el modifier cubre olvidos.

OpenZeppelin ofrece `ReentrancyGuard` con esta misma idea.

## Errores personalizados en modifiers

Los modifiers usan `revert Error(...)` en vez de `require(cond, "texto")`:

- Cuestan menos gas (no guardan el texto en el bytecode).
- Pueden llevar datos (`EnCooldown(3599)` indica cuantos segundos faltan).

## Cuidado con los modifiers

- **Un modifier es codigo copiado en cada funcion que lo usa**. Un modifier grande usado en 20 funciones aumenta el tamano del contrato. Si el chequeo es largo, ponlo en una funcion `internal` y llamala desde el modifier.
- **Evita logica compleja**. Un modifier que hace llamadas externas o cambia mucho estado esconde comportamiento y dificulta leer la funcion.
- **`_` puede aparecer mas de una vez** y el cuerpo de la funcion se ejecutaria varias veces. Casi siempre es un bug.

## Ejecutar el test

```bash
npx hardhat test test/06-ModifiersAvanzados.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ModifiersAvanzados.ts --network hardhatMainnet
```

## Errores comunes

### `Modifier body does not contain '_'`

El modifier no tiene `_;`, asi que la funcion nunca se ejecutaria. El compilador lo rechaza.

### Resetear el bloqueo antes de tiempo

Si escribes `_bloqueado = false;` antes de `_;`, la proteccion no sirve.

### Confundir "antes" y "despues" al apilar

Con varios modifiers, el codigo que va despues de `_` se ejecuta en orden **inverso** al de los chequeos. Dibuja el orden en papel antes de apilar modifiers que dependen entre si.

## Ejercicios

1. Crea un modifier `soloEntreHoras(uint256 desde, uint256 hasta)` que use `block.timestamp`.
2. Agrega un modifier `maximoPorLlamada(uint256 tope)` sobre `msg.value`.
3. Comenta `noReentrante` de `retirar()`. Que error recibe ahora el atacante? Por que el patron checks-effects-interactions ya lo frena?

## Resumen

- `_;` marca donde se ejecuta la funcion; se puede poner codigo antes y despues.
- Los modifiers reciben parametros y se pueden apilar de izquierda a derecha.
- `noReentrante` + checks-effects-interactions protegen contra reentrada.
- Usa errores personalizados y evita logica pesada dentro de un modifier.
