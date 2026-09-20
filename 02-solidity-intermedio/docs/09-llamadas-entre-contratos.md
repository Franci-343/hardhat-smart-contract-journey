# 09 - Llamadas entre contratos

Los contratos pueden llamar a otros contratos. Asi se construyen los protocolos: un token, un mercado y un oraculo trabajan juntos, cada uno en su propio contrato.

Archivos de esta leccion:

- `contracts/09-LlamadasEntreContratos.sol`
- `test/09-LlamadasEntreContratos.ts`
- `ignition/modules/09-LlamadasEntreContratos.ts`
- `scripts/deploy-LlamadasEntreContratos.ts`

## Llamar a otro contrato con una interfaz

Necesitas dos cosas: la **direccion** del destino y una **interfaz** que describa sus funciones (leccion 04):

```solidity
interface IContador {
    function incrementar() external returns (uint256);
    function establecer(uint256 nuevoValor) external;
    function valor() external view returns (uint256);
}

contract Llamador {
    IContador public immutable contador;

    constructor(address contador_) {
        contador = IContador(contador_);
    }

    function incrementarRemoto() external returns (uint256) {
        return contador.incrementar();     // llamada externa
    }
}
```

`Llamador` no importa el codigo de `Contador`: solo necesita saber que funciones tiene.

Cada `contador.incrementar()` es una **llamada externa**: la EVM ejecuta el codigo del otro contrato, con su propio storage, y devuelve el resultado. Si el destino revierte, por defecto tu funcion tambien revierte (mas adelante veras `try/catch` para evitarlo).

## `msg.sender` y `tx.origin`

Cuando el usuario llama a `Llamador`, y este llama a `Contador`:

```text
Usuario (EOA) --> Llamador --> Contador
```

En `Contador`:

| Variable | Valor |
| --- | --- |
| `msg.sender` | La direccion de **Llamador** (quien llamo directamente) |
| `tx.origin` | La direccion del **usuario** (quien firmo la transaccion) |

El test lo demuestra:

```ts
await llamador.write.incrementarRemoto();

assert.equal(getAddress(await contador.read.ultimoSender()), getAddress(llamador.address));
assert.equal(getAddress(await contador.read.ultimoOrigen()), getAddress(owner.account.address));
```

Cada contrato ve como `msg.sender` al que lo llamo **directamente**. Esto tiene una consecuencia importante: si un contrato autoriza por `msg.sender == owner`, y el owner usa un contrato intermediario, la comprobacion fallara.

### Por que no usar `tx.origin` para autorizar

`tx.origin` siempre es una cuenta externa, nunca un contrato. Parece comodo para "solo el dueno puede", pero es peligroso:

```solidity
// MAL
require(tx.origin == owner);
```

Un contrato malicioso puede enganar al owner para que lo llame (por ejemplo, prometiendole un premio). Como el owner firmo la transaccion, `tx.origin` es el owner y la comprobacion pasa aunque el que ejecuta sea el atacante. **Autoriza siempre con `msg.sender`.**

## Crear contratos desde contratos

`new` despliega un contrato nuevo desde otro:

```solidity
contract FabricaContadores {
    Contador[] public creados;

    function crear() external returns (address) {
        Contador nuevo = new Contador();
        creados.push(nuevo);
        emit ContadorCreado(address(nuevo), msg.sender);
        return address(nuevo);
    }
}
```

Es el patron **fabrica (factory)**: Uniswap crea un contrato por cada par de tokens; las wallets multi-firma crean un contrato por cada wallet nueva.

Cada contrato creado tiene su **propio estado** y su propia direccion. En el test, al incrementar el primero, el segundo sigue en `0`.

Ventajas del patron:

- Un evento con la direccion nueva permite a las aplicaciones encontrar los contratos creados.
- Puedes guardar un registro de todos los creados.

Costes: cada `new` despliega un contrato completo (caro en gas). Para muchas copias identicas existen los "clones minimos" (EIP-1167, modulo 03).

## Enviar ETH junto con la llamada

Con la sintaxis `{value: ...}`:

```solidity
otro.funcionPayable{value: 1 ether}(args);
```

Y limitar el gas con `{gas: ...}`. Veras el detalle en la leccion 10.

## Riesgos de las llamadas externas

Cada llamada externa **cede el control** a otro codigo. Si ese contrato es malicioso o tiene un bug, puede:

- Revertir (rompiendo tu funcion).
- Gastar todo el gas.
- Volver a llamar a tu contrato (reentrada, leccion 06).

Buenas practicas:

1. Actualiza tu estado **antes** de la llamada externa (checks-effects-interactions).
2. No asumas que el destino se comporta bien.
3. Trata las llamadas a direcciones que recibes como parametro como no confiables.
4. Prefiere interfaces conocidas (`IERC20`) a llamadas arbitrarias.

## Ejecutar el test

```bash
npx hardhat test test/09-LlamadasEntreContratos.ts
```

## Desplegar

Con Ignition, el orden de despliegue se deduce solo: `Llamador` recibe la direccion de `Contador`, asi que Ignition despliega primero `Contador`.

```ts
const contador = m.contract("Contador");
const llamador = m.contract("Llamador", [contador]);
```

```bash
npx hardhat ignition deploy ignition/modules/09-LlamadasEntreContratos.ts --network hardhatMainnet
npx hardhat run scripts/deploy-LlamadasEntreContratos.ts --network hardhatMainnet
```

## Errores comunes

### Llamar a una direccion que no es un contrato

La llamada revierte o falla al decodificar el resultado. Comprueba que la direccion sea correcta y que estas en la red correcta.

### Confundir `msg.sender` dentro del destino

Recuerda: ahi `msg.sender` es tu contrato, no el usuario. Si necesitas el usuario original, pasalo como parametro (y validalo).

### Interfaz con firma distinta

Si tu interfaz dice `uint256 valor()` pero el contrato real la define con otro tipo, la llamada falla o lee basura.

## Ejercicios

1. Agrega `establecer` a `Llamador` con un modifier que solo permita al owner llamarlo.
2. Crea una `FabricaLlamadores` que cree un `Llamador` para cada `Contador` existente.
3. Intenta un ataque con `tx.origin`: escribe un contrato `Trampa` que llame a un contrato protegido con `tx.origin`. Observa por que funciona y como lo corrige `msg.sender`.

## Resumen

- Se llama a otros contratos con una **interfaz** y una direccion.
- El destino ve como `msg.sender` a tu contrato; `tx.origin` es el usuario que firmo.
- Nunca autorices con `tx.origin`.
- `new` crea contratos desde contratos (patron fabrica).
- Toda llamada externa cede el control: actualiza tu estado antes.
