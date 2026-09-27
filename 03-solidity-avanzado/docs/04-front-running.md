# 04 - Front-running y commit-reveal

Antes de que una transaccion se mine, es visible para cualquiera que mire el mempool (la lista de transacciones pendientes). Esta leccion muestra que se puede hacer con eso, y como se defiende con el patron commit-reveal.

Archivos de esta leccion:

- `contracts/04-FrontRunning.sol`
- `test/04-FrontRunning.ts`
- `ignition/modules/04-FrontRunning.ts`
- `scripts/deploy-FrontRunning.ts`

## El escenario: primero en llegar, gana

```solidity
function resolver(string calldata respuesta) external {
    require(ganador == address(0), "Ya resuelto");
    require(keccak256(abi.encodePacked(respuesta)) == hashRespuesta, "Respuesta incorrecta");

    ganador = msg.sender;
    // ... paga el premio a msg.sender ...
}
```

El contrato solo conoce el HASH de la respuesta (`hashRespuesta`), no la respuesta en si. Alguien tiene que resolver el acertijo y enviar la respuesta en texto plano para reclamar el premio. Hasta aca, nada raro.

El problema aparece en el momento en que esa transaccion queda **pendiente**, antes de ser minada: cualquiera que mire el mempool puede leer `respuesta` en la transaccion de otra persona, copiarla en la suya, pagar mas gas (para que la red la priorice), y que la copia se mine primero.

```ts
// La victima resolvio el acertijo y va a enviar su transaccion...
// El atacante ve "ETHEREUM" en el mempool y envia la SUYA primero.
await acertijo.write.resolver([RESPUESTA], { account: atacante.account });

assert.equal(getAddress(await acertijo.read.ganador()), getAddress(atacante.account.address));

// Cuando la transaccion de la victima se mina, ya es tarde.
await viem.assertions.revertWith(acertijo.write.resolver([RESPUESTA], { account: victima.account }), "Ya resuelto");
```

El atacante no resolvio nada: solo copio. Este es el patron general de front-running: **ver una transaccion de valor en el mempool y actuar antes, con la misma informacion.**

### Lo que este test SI demuestra, y lo que NO

El test (y el script) simplemente llaman `resolver()` del atacante ANTES que el de la victima: eso demuestra el **efecto** de un front-running exitoso (quien copia y llega primero se queda con el premio), pero no reproduce una carrera real por el mempool con gas de por medio, ni en local ni en Sepolia. En una red real, "llegar primero" depende de que un minero/validador priorice tu transaccion, tipicamente porque pagaste mas gas. Si quisieras ver eso de verdad en Sepolia, harian falta dos transacciones REALMENTE pendientes al mismo tiempo (por ejemplo, dos cuentas distintas enviando `resolver()` con la misma respuesta, una con mas `maxFeePerGas` que la otra) y observar en un explorador cual se mina primero. Esta leccion se queda con la version simplificada porque el mecanismo del ataque (copiar informacion visible en una transaccion pendiente) es el mismo, y es mucho mas facil de estudiar sin depender de la variabilidad real de un mempool.

## Front-running mas alla de los acertijos

Este mismo mecanismo aparece en escenarios mas realistas:

- **Sniping de transacciones rentables**: ver una transaccion que arbitra un precio o reclama un descuento, y copiarla con mas gas.
- **Sandwich attacks**: ver el swap grande de alguien en un DEX, comprar justo antes (subiendo el precio), dejar que la victima compre caro, y vender justo despues. Es una de las formas mas comunes de "MEV" (Maximal Extractable Value) en Ethereum hoy.
- **Bidding en subastas**: ver la puja de otra persona y superarla en el ultimo momento, ANTES de que la suya se confirme.

## La defensa: commit-reveal

La idea: separar la accion en dos fases. En la primera, todos comprometen un **hash** que no revela nada. En la segunda (una vez que ya no importa que se sepa), revelan el valor real.

```solidity
// Fase 1: comprometer.
function comprometer(bytes32 hashCompromiso) external {
    compromisos[msg.sender] = hashCompromiso;
}

// Fase 2: revelar.
function revelar(string calldata respuesta, bytes32 secreto) external {
    require(
        keccak256(abi.encodePacked(respuesta, secreto, msg.sender)) == compromisos[msg.sender],
        "No coincide con tu compromiso"
    );
    require(keccak256(abi.encodePacked(respuesta)) == hashRespuesta, "Respuesta incorrecta");

    ganador = msg.sender;
    // ... paga el premio ...
}
```

### La pieza clave: `msg.sender` dentro del hash

`hashCompromiso` no es solo `keccak256(respuesta, secreto)`: incluye la DIRECCION de quien comprometio. Esto es lo que hace que copiar no sirva.

Si un atacante ve la transaccion de `revelar()` de la victima en el mempool (con `respuesta` y `secreto` ya en texto plano, porque estamos en la fase de revelar) y trata de copiarla:

```ts
await viem.assertions.revertWith(
  acertijo.write.revelar([RESPUESTA, secreto], { account: atacante.account }),
  "No coincide con tu compromiso",
);
```

El hash que el atacante necesitaria para pasar la validacion es `keccak256(respuesta, secreto, DIRECCION_DEL_ATACANTE)`. Pero lo que el atacante comprometio (si comprometio algo) fue otro hash, calculado con SU secreto, no con el de la victima. Y aunque el atacante intente usar el mismo `(respuesta, secreto)` que vio, el resultado del hash cambia porque la direccion es distinta: nunca va a coincidir con `compromisos[atacante]`.

La fase de commit tampoco es explotable: un hash no revela la respuesta ni el secreto, asi que no hay nada que copiar todavia.

## Cuando commit-reveal alcanza, y cuando no

Commit-reveal resuelve bien el problema de "revelar tu secreto sin que alguien lo copie a tiempo". No resuelve, por si solo, el front-running de **transacciones de valor visible** (como un swap grande en un DEX): ahi el problema no es un secreto que se filtra, es que la operacion en si misma (comprar X, a este precio) ya es valiosa de copiar o de anteponerse, sin que haga falta ningun secreto. Para esos casos, las defensas tipicas son otras: subastas selladas de verdad (con montos ocultos hasta el cierre), relays privados que no exponen la transaccion al mempool publico, o commit-reveal aplicado al ORDEN de ejecucion (no solo al contenido).

## Ejecutar el test

```bash
npx hardhat test test/04-FrontRunning.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-FrontRunning.ts --network hardhatMainnet
```

## Errores comunes

### Comprometer un hash sin incluir la direccion de quien comete

Sin `msg.sender` en el hash, cualquiera que vea el `reveal` de otra persona puede revelar exactamente lo mismo, ANTES, con mas gas, y quedarse con el premio el mismo.

### Revelar demasiado pronto

Si la fase de "commit" y la de "reveal" no estan separadas por una condicion real (un bloque minimo de espera, o que la fase de commit este cerrada), un atacante puede comprometer y revelar en la MISMA transaccion, viendo lo que otros ya revelaron antes que el.

### Creer que hashear alcanza sin pensar el resto del flujo

Un hash sin verificacion de quien lo comprometio (osea, sin `msg.sender` en la formula) sigue siendo copiable.

## Ejercicios

1. Agrega una ventana de tiempo: la fase de "revelar" solo puede empezar despues de cierto bloque, para asegurar que todos ya comprometieron antes de que nadie revele.
2. Adaptalo a una subasta simple: cada participante comprometa `keccak256(monto, secreto, msg.sender)`, y al revelar, quien tenga el monto mas alto gane.
3. Escribe un tercer contrato que intente front-runnear la fase de COMMIT (no la de reveal) y demuestra por que no le sirve de nada.

## Resumen

- Toda transaccion pendiente es visible en el mempool antes de minarse: cualquiera puede leerla y copiarla con mas gas.
- El front-running mas simple es copiar una respuesta o accion visible y que se mine primero.
- Commit-reveal separa "comprometerse" (un hash, sin informacion) de "revelar" (el valor real, cuando ya no importa que se vea).
- Incluir `msg.sender` en el hash del compromiso es lo que hace que copiar el reveal de otra persona no sirva de nada.
