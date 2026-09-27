# 13 - Firmas fuera de cadena y EIP-712

Hasta ahora, cada accion en un contrato vino de una transaccion firmada y enviada por quien la ejecuta. EIP-712 permite otra cosa: firmar un mensaje **sin enviar ninguna transaccion**, y que OTRA cuenta (que paga el gas) lo presente al contrato despues. Es la base de las "meta-transacciones" y de funciones como `permit` en tokens modernos.

Archivos de esta leccion:

- `contracts/13-FirmasEIP712.sol`
- `test/13-FirmasEIP712.ts`
- `ignition/modules/13-FirmasEIP712.ts`
- `scripts/deploy-FirmasEIP712.ts`

## El problema que resuelve

Firmar un mensaje con una wallet (sin transaccion) no cuesta gas. Si un contrato puede verificar esa firma y actuar en nombre de quien firmo, se abre una posibilidad util: alguien puede "autorizar" una accion sin pagar gas, y otra cuenta (un relayer, o la misma dapp) puede ejecutarla y pagar el gas por ella.

El desafio tecnico: como verificar, ON-CHAIN, que una firma corresponde a un mensaje especifico y a una cuenta especifica? Y como evitar que esa misma firma se reutilice, o se use en un contrato o red distinta de la que se pensaba?

## `ecrecover`: el opcode que recupera un firmante

Ethereum usa firmas ECDSA. Dado un hash de 32 bytes y una firma (`v`, `r`, `s`), `ecrecover(hash, v, r, s)` devuelve la direccion que firmo ese hash exacto:

```solidity
address recuperado = ecrecover(hash, v, r, s);
if (recuperado == address(0) || recuperado != firmante) revert FirmaInvalida();
```

Si el `hash` no es exactamente el mismo que se firmo (un solo bit distinto), `ecrecover` devuelve una direccion completamente distinta (o `address(0)` en casos invalidos), no un error. Por eso construir el `hash` de forma correcta y verificable es el corazon de esta leccion.

## El problema de firmar "cualquier cosa"

Si simplemente firmaras `keccak256(destino, monto)`, dos problemas:

1. Tu wallet (MetaMask, por ejemplo) mostraria un blob de bytes ilegible al firmar: no hay forma de que el usuario sepa que esta autorizando.
2. La misma firma podria ser valida para OTRO contrato, o en OTRA red, si por casualidad esos mismos bytes significan algo ahi tambien.

**EIP-712** estandariza como estructurar datos firmables para resolver ambos problemas: la wallet puede mostrar los campos del mensaje con nombre (en vez de bytes crudos), y el hash incluye un "dominio" que ata la firma a un contrato y una red especificos.

## El dominio: a que contrato y red pertenece esta firma

```solidity
bytes32 private constant _TYPE_HASH_DOMINIO =
    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

_DOMAIN_SEPARATOR = keccak256(
    abi.encode(
        _TYPE_HASH_DOMINIO,
        keccak256(bytes("Curso Solidity Avanzado")),
        keccak256(bytes("1")),
        block.chainid,
        address(this)
    )
);
```

El `chainId` y `verifyingContract` (la direccion de ESTE contrato) quedan "cocinados" dentro del hash. Una firma calculada para este dominio no es valida en otra red, ni en otro contrato, aunque el resto del mensaje sea identico.

## El tipo del mensaje

```solidity
bytes32 private constant _TYPE_HASH_AUTORIZACION =
    keccak256("Autorizacion(address destino,uint256 monto,uint256 nonce,uint256 plazo)");

function hashParaFirmar(address destino, uint256 monto, uint256 nonce, uint256 plazo) public view returns (bytes32) {
    bytes32 hashMensaje = keccak256(abi.encode(_TYPE_HASH_AUTORIZACION, destino, monto, nonce, plazo));
    return keccak256(abi.encodePacked("\x19\x01", _DOMAIN_SEPARATOR, hashMensaje));
}
```

El prefijo `"\x19\x01"` es parte del estandar EIP-712: le dice a las wallets (y a cualquiera que audite el hash) "esto es un hash EIP-712 tipado", distinguiendolo de otros esquemas de firma.

## Firmar desde TypeScript, y verificar que coincide

El test firma el mensaje con `signTypedData` de viem, usando exactamente la misma estructura (`domain`, `types`, `message`) que el contrato espera:

```ts
const firma = await firmante.signTypedData({
  domain: {
    name: "Curso Solidity Avanzado",
    version: "1",
    chainId: await publicClient.getChainId(),
    verifyingContract: contrato.address,
  },
  types: {
    Autorizacion: [
      { name: "destino", type: "address" },
      { name: "monto", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "plazo", type: "uint256" },
    ],
  },
  primaryType: "Autorizacion",
  message: { destino: destino.account.address, monto: parseEther("0.4"), nonce: 0n, plazo },
});
```

`signTypedData` implementa EIP-712 de forma independiente al contrato (es la implementacion de viem, no la de este curso). Que la firma resultante pase la verificacion de `ecrecover` en el contrato es, otra vez, una comprobacion cruzada entre dos implementaciones distintas: si el dominio o el tipo del contrato no coincidieran exactamente con lo que se firmo, `ecrecover` devolveria una direccion distinta a `firmante`, y el test fallaria.

```ts
// El RELAYER envia la transaccion, pero el saldo que se mueve es el del FIRMANTE.
await contrato.write.ejecutarConFirma(
  [firmante.account.address, destino.account.address, monto, nonce, plazo, v, r, s],
  { account: relayer.account },
);
```

## Evitando la reutilizacion: `nonce` y `plazo`

```solidity
mapping(address => uint256) public nonces;

if (block.timestamp > plazo) revert FirmaExpirada(plazo, block.timestamp);
if (nonce != nonces[firmante]) revert NonceIncorrecto(nonces[firmante], nonce);
// ...
nonces[firmante]++;
```

Una firma, por si sola, no "sabe" si ya se uso: es solo un dato matematico valido para siempre. Dos protecciones:

- **`nonce`**: cada cuenta tiene un contador que sube en 1 con cada ejecucion exitosa. Una firma vieja tiene un `nonce` que ya no coincide con el actual, asi que no se puede reenviar (replay).
- **`plazo`**: una fecha limite mas alla de la cual la firma deja de ser valida, aunque nadie la haya usado todavia.

```ts
await contrato.write.ejecutarConFirma([...]); // funciona la primera vez

await viem.assertions.revertWithCustomErrorWithArgs(
  contrato.write.ejecutarConFirma([...]), // la MISMA firma, otra vez
  contrato, "NonceIncorrecto", [1n, 0n],
);
```

## Donde vas a ver esto en la practica

- **`permit` (EIP-2612)**: en vez de `approve()` + `transferFrom()` (dos transacciones, modulo 02 leccion 14), el usuario firma un `permit` fuera de cadena, y quien lo ejecuta llama `permit()` + `transferFrom()` en una sola transaccion, sin que el usuario haya pagado gas por el `approve`.
- **Meta-transacciones**: un usuario firma una intencion ("quiero hacer X"), y un relayer la ejecuta y paga el gas, permitiendo que usuarios sin ETH interactuen con un contrato.
- **Votaciones y gobernanza off-chain**: firmar un voto sin gastar gas, y que se cuenten en batch mas adelante.

## Ejecutar el test

```bash
npx hardhat test test/13-FirmasEIP712.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-FirmasEIP712.ts --network hardhatMainnet
```

## Errores comunes

### Omitir `chainId` o `verifyingContract` del dominio

Sin ellos, una firma valida en tu contrato en Sepolia podria tambien ser valida en mainnet, o en otro contrato con el mismo nombre de tipo. Siempre incluyelos.

### Olvidar el `nonce`

Sin nonce, cualquier firma valida se puede reenviar una y otra vez (replay attack), ejecutando la misma accion multiples veces.

### Firmar con `personal_sign` en vez de `signTypedData`

Son esquemas distintos. Si el contrato espera un hash EIP-712 (con el prefijo `\x19\x01`) y la wallet firma con el prefijo de mensaje personal (`\x19Ethereum Signed Message:\n`), `ecrecover` nunca va a coincidir.

## Ejercicios

1. Agrega una funcion `cancelar(uint256 nonce)` que el firmante pueda llamar directamente (con su propia transaccion) para invalidar una firma pendiente antes de que un relayer la ejecute.
2. Cambia el mensaje para incluir un campo `mensaje` de tipo `string`, y actualiza el type hash y la llamada desde TypeScript.
3. Demuestra que una firma calculada con un `chainId` distinto (simulado, no real) no pasa la verificacion.

## Resumen

- EIP-712 estructura datos firmables para que las wallets los muestren con claridad y para atar la firma a un contrato y una red especificos (el "dominio").
- `ecrecover(hash, v, r, s)` recupera quien firmo un hash exacto; un hash mal construido recupera una direccion distinta, sin error explicito.
- `nonce` y `plazo` evitan que una firma se reutilice o se use fuera de tiempo.
- Verificar tu firma contra la implementacion independiente de una libreria (`signTypedData` de viem) es la forma mas confiable de confirmar que el dominio y el tipo estan bien construidos.
