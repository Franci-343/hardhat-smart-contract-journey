# 02 - Vulnerabilidades de control de acceso

En el modulo 02 (lecciones 12 y 13) construiste control de acceso: roles, `Ownable`, modifiers. Aca vas a ver como se ve cuando **falta**, y por que un `require` que parece correcto puede seguir estando mal.

Archivos de esta leccion:

- `contracts/02-AccessControlVulnerable.sol`
- `test/02-AccessControlVulnerable.ts`
- `ignition/modules/02-AccessControlVulnerable.ts`
- `scripts/deploy-AccessControlVulnerable.ts`

## Parte 1: la funcion sin proteger

```solidity
function declararGanador(address nuevoGanador) external {
    ganador = nuevoGanador;
}
```

No hay truco, no hay ataque sofisticado: la funcion simplemente **no comprueba quien la llama**. Este es, con diferencia, el bug de control de acceso mas comun en auditorias reales: no una tecnica rara, sino una funcion sensible a la que alguien se olvido de agregarle un `require` o un modifier.

```ts
await cofre.write.declararGanador([cualquiera.account.address], { account: cualquiera.account });
// "cualquiera" no es el admin, y sin embargo esto funciona.
```

La correccion es exactamente lo que ya aprendiste en el modulo 02:

```solidity
modifier soloAdmin() {
    if (msg.sender != admin) revert NoEsAdmin(msg.sender);
    _;
}

function declararGanador(address nuevoGanador) external soloAdmin { ... }
```

**El habito que previene esto:** cuando escribas o revises una funcion `external`/`public`, la primera pregunta es "quien deberia poder llamar esto, y hay algo en el codigo que lo obligue?". No asumas que una funcion esta protegida porque "tiene pinta de admin".

## Parte 2: `tx.origin` en vez de `msg.sender`

Esta es mas sutil: la funcion SI tiene un `require`, y a primera vista parece razonable.

```solidity
function retirarTodo(address payable destino) external {
    require(tx.origin == owner, "No autorizado");
    (bool ok, ) = destino.call{value: address(this).balance}("");
    require(ok, "Envio fallido");
}
```

Repaso rapido (modulo 02, leccion 09): `msg.sender` es quien te llamo **directamente**; `tx.origin` es la cuenta externa (EOA) que **firmo la transaccion original**, sin importar cuantos contratos intermedios haya en el camino.

### El ataque: phishing con un contrato intermediario

```solidity
contract ContratoPhishing {
    function reclamarRecompensa() external {
        banco.retirarTodo(payable(atacante));
    }
}
```

El nombre de la funcion es la trampa. Si el **owner del banco** firma una transaccion que llama a `reclamarRecompensa()` (creyendo que va a reclamar algo bueno), la cadena de llamadas es:

```text
Owner (EOA, firma la transaccion)
  -> ContratoPhishing.reclamarRecompensa()
      -> BancoConTxOrigin.retirarTodo(atacante)
```

Dentro de `retirarTodo`: `tx.origin` es el **owner** (el que firmo, al principio de toda la cadena). `msg.sender` es `ContratoPhishing` (quien llamo directamente). El `require(tx.origin == owner)` **pasa**, aunque el owner nunca llamo al banco directamente ni tuvo intencion de autorizar un retiro.

```ts
// El OWNER firma esta transaccion creyendo que hace otra cosa.
await trampa.write.reclamarRecompensa({ account: owner.account });

// El banco quedo vacio, y el ETH fue al atacante.
assert.equal(await banco.read.contractBalance(), 0n);
```

### La correccion: una palabra

```solidity
require(msg.sender == owner, "No autorizado");
```

Con `msg.sender`, el `require` ve que quien llamo DIRECTAMENTE al banco fue `ContratoPhishing`, no el owner, y revierte. El mismo intento de phishing, contra la version corregida, falla:

```ts
await viem.assertions.revertWith(trampa.write.reclamarRecompensa({ account: owner.account }), "No autorizado");
```

## Por que `tx.origin` sigue apareciendo en codigo nuevo

Suele parecer "mas seguro" a primera vista: "solo la cuenta original puede hacer esto". El problema es que confunde dos preguntas distintas:

- `msg.sender == owner` responde: **"me esta llamando el owner, ahora mismo, directamente?"**
- `tx.origin == owner` responde: **"esta transaccion, en algun punto de la cadena, la empezo el owner?"**

Para control de acceso casi siempre quieres la primera pregunta. La segunda es la que un atacante puede manipular haciendo que el owner interactue con SU contrato en lugar del tuyo.

Regla practica: **nunca uses `tx.origin` para autorizar.** Los (pocos) usos legitimos de `tx.origin` son para detectar SI una llamada viene de una EOA o de un contrato (comparando `tx.origin == msg.sender`), no para decidir permisos.

## Ejecutar el test

```bash
npx hardhat test test/02-AccessControlVulnerable.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-AccessControlVulnerable.ts --network hardhatMainnet
```

## Errores comunes

### Suponer que "nadie va a interactuar con un contrato random"

El ataque de phishing depende de que el owner interactue con un contrato que no controla. En la practica, esto pasa: contratos que prometen airdrops, recompensas, o simplemente links maliciosos que apuntan a interactuar con un contrato desconocido desde una wallet conectada.

### Arreglar un bug de acceso y no revisar el resto del contrato

Si un contrato tiene una funcion sin proteger, es una senal de que revises **todas** las demas funciones sensibles con la misma pregunta.

### Proteger con `tx.origin` "porque ya funcionaba antes"

Si encuentras `tx.origin` en un contrato que estas auditando, es una bandera roja que hay que revisar, incluso si nunca fue explotado: el hecho de que nadie lo haya explotado todavia no significa que sea seguro.

## Ejercicios

1. Agrega un `reclamarPremio` a `CofrePremiosVulnerable` que use `tx.origin` en vez de `msg.sender`, y escribe un contrato de phishing que lo explote.
2. Cambia `ContratoPhishing` para que, en lugar de retirar TODO, retire solo una fraccion (por ejemplo, la mitad) y demuestra que el ataque sigue funcionando igual.
3. Escribe una funcion que use `tx.origin == msg.sender` correctamente, para detectar si quien llama es una EOA o un contrato (no para autorizar).

## Resumen

- El bug de control de acceso mas comun es simplemente **olvidar proteger** una funcion sensible.
- `tx.origin` identifica quien firmo la transaccion ORIGINAL; `msg.sender` identifica quien te llamo A TI directamente.
- Un contrato intermediario "de apariencia inocente" puede aprovechar `tx.origin` para que el owner autorice algo sin darse cuenta.
- Autoriza siempre con `msg.sender`. Nunca con `tx.origin`.
