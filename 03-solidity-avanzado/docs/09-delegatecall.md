# 09 - `delegatecall` a fondo

En el modulo 02 (leccion 10) viste `call` y `staticcall`. `delegatecall` es el tercero, y el mas peligroso de entender mal: ejecuta el CODIGO de otro contrato, pero usando TU storage, TU `msg.sender` y TU `msg.value`. Es la base de los proxies (lecciones 10 y 11), y una de las formas mas comunes de romper un contrato por accidente.

Archivos de esta leccion:

- `contracts/09-Delegatecall.sol`
- `test/09-Delegatecall.ts`
- `ignition/modules/09-Delegatecall.ts`
- `scripts/deploy-Delegatecall.ts`

## La diferencia con `call`, en una tabla

| | `call` | `delegatecall` |
| --- | --- | --- |
| Codigo que se ejecuta | Del destino | Del destino |
| Storage que se usa | Del destino | **De quien llama** |
| `msg.sender` dentro | Quien llama | **El sender original** (no cambia) |
| `msg.value` dentro | El que se envio en esta llamada | **El original** (no cambia) |

La forma mas facil de pensarlo: `delegatecall` es como copiar y pegar el codigo del destino DENTRO de tu propia funcion, en el momento de ejecutar. Todo lo que ese codigo lea o escriba, lo lee o escribe de TU contrato.

## El bug: colision de storage

```solidity
contract LogicaContador {
    uint256 public contador; // slot 0

    function incrementar() external {
        contador += 1;
    }
}
```

`LogicaContador` esta escrito pensando que `contador` vive en el slot 0. Eso es cierto **cuando se ejecuta normalmente**. Pero si se ejecuta via `delegatecall` desde otro contrato, "slot 0" pasa a significar "el slot 0 de QUIEN LLAMO", sea lo que sea que ese contrato tenga ahi.

```solidity
contract ProxyMalo {
    address public owner;    // slot 0 (!)
    uint256 public contador; // slot 1

    function incrementar(address logica) external {
        (bool ok, ) = logica.delegatecall(abi.encodeWithSignature("incrementar()"));
        require(ok, "delegatecall fallo");
    }
}
```

Cuando `ProxyMalo.incrementar()` hace `delegatecall` a `LogicaContador.incrementar()`, ese codigo ejecuta `contador += 1` pensando en SU slot 0. Pero en `ProxyMalo`, el slot 0 es `owner`, no `contador`. El resultado:

```ts
await proxy.write.incrementar([logica.address]);

// El contador "de verdad" (slot 1) sigue en 0: Logica nunca escribio ahi.
assert.equal(await proxy.read.contador(), 0n);

// owner (slot 0) cambio: Logica escribio ahi creyendo que era `contador`.
assert.notEqual(getAddress(ownerDespues), getAddress(ownerAntes));
```

`owner` queda corrompido con un valor que no tiene sentido como direccion (es la direccion original interpretada como numero, mas uno), y el contador que en teoria se estaba incrementando **nunca cambio**.

## La correccion: mismo orden de variables

```solidity
contract ProxyBueno {
    uint256 public contador; // slot 0, igual que en LogicaContador
    address public owner;    // slot 1, despues de lo que Logica usa
}
```

Con este orden, el `delegatecall` de `LogicaContador.incrementar()` escribe en el slot 0 del proxy, que ahora SI es `contador`. El resto de las variables del proxy (`owner`) van despues, en slots que `LogicaContador` nunca toca.

```ts
await proxy.write.incrementar([logica.address]);
await proxy.write.incrementar([logica.address]);

assert.equal(await proxy.read.contador(), 2n); // funciona
assert.equal(getAddress(await proxy.read.owner()), getAddress(ownerAntes)); // owner intacto
```

**La regla para cualquier contrato que va a recibir `delegatecall`:** su storage tiene que coincidir, byte por byte y en el mismo orden, con el storage que el codigo delegado espera. Esto es exactamente lo que vas a ver formalizado en las lecciones 10 y 11 con proxies.

## `msg.sender` y `msg.value` viajan intactos

```solidity
function quienMeLlama() external view returns (address) {
    return msg.sender;
}
```

Si `ProxyBueno` delegatecallea esta funcion, `msg.sender` **dentro** de `quienMeLlama()` no es `ProxyBueno`: es quien llamo a `ProxyBueno` en primer lugar.

```ts
const { result } = await proxy.simulate.preguntarQuienLlama([logica.address], {
  account: alguien.account,
});

assert.equal(getAddress(result), getAddress(alguien.account.address));
```

Esto es exactamente lo que hace posible que un proxy sea "transparente": cuando un usuario llama a un proxy y el proxy delegatecallea a la logica, la logica ve al USUARIO como `msg.sender`, no al proxy. Sin esta propiedad, cada funcion de la logica tendria que recibir el `msg.sender` real como parametro extra, y cualquiera podria falsificarlo.

## Por que las librerias con funciones `internal` no usan `delegatecall`

En el modulo 02 (leccion 05) viste que las librerias con funciones `internal` (como `MathLib`) NO usan `delegatecall`: el compilador copia su codigo directamente dentro del contrato que las usa, en tiempo de compilacion. `delegatecall` solo entra en juego con funciones `external`/`public` de una libreria desplegada por separado, o con proxies como los que vas a construir en las proximas lecciones.

## Ejecutar el test

```bash
npx hardhat test test/09-Delegatecall.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-Delegatecall.ts --network hardhatMainnet
```

## Errores comunes

### Suponer que el storage "se resuelve solo"

No hay ninguna verificacion automatica de que el storage de quien llama coincida con lo que el codigo delegado espera. Es responsabilidad de quien escribe el contrato.

### Delegatecallear a una direccion que no controlas

Si `logica` es una direccion arbitraria (por ejemplo, un parametro que cualquiera puede pasar), quien la controla puede ejecutar CUALQUIER codigo con TU storage y TU identidad. `delegatecall` a una direccion no confiable es, en la practica, casi lo mismo que darle a esa direccion control total de tu contrato.

### Olvidar que `delegatecall` tambien puede enviar `value` sin querer

Si tu funcion es `payable` y delegatecalleas, el `msg.value` original sigue disponible para el codigo delegado, que podria (si tiene esa logica) intentar usarlo de formas que no esperabas.

## Ejercicios

1. Agrega una tercera variable a `LogicaContador` (por ejemplo, `address public autor`) y demuestra que `ProxyBueno`, si no reserva un slot para ella tambien, sufre una colision nueva.
2. Escribe un `ProxyGenerico` que delegatecallee a CUALQUIER direccion que reciba como parametro (sin fijarla en el constructor), y demuestra por que es peligroso dejarlo sin restricciones de quien puede llamarlo.
3. Demuestra con un test que `msg.value` tambien se preserva a traves de un `delegatecall` (agrega una funcion `payable` a `LogicaContador` que guarde `msg.value` recibido).

## Resumen

- `delegatecall` ejecuta el codigo de otro contrato usando TU storage, TU `msg.sender` y TU `msg.value`.
- Si el storage de quien llama no coincide, en orden y tipos, con el que el codigo delegado espera, los datos se corrompen en silencio.
- `msg.sender` y `msg.value` no cambian a traves de un `delegatecall`: siguen siendo los de la llamada original.
- `delegatecall` a una direccion no confiable equivale, en la practica, a darle control total sobre tu contrato.
