# 16 - ERC-1155: multi-token

ERC-20 (modulo 02) maneja UN tipo de token por contrato. ERC-721 (modulo 02) maneja NFTs unicos, uno por `tokenId`. ERC-1155 combina ambas ideas: UN SOLO contrato puede manejar MUCHOS tipos de token distintos, cada uno identificado por un `id`, y cada `id` puede comportarse como fungible o como unico.

Archivos de esta leccion:

- `contracts/16-ERC1155Basico.sol`
- `test/16-ERC1155Basico.ts`
- `ignition/modules/16-ERC1155Basico.ts`
- `scripts/deploy-ERC1155Basico.ts`

## La diferencia central: balances por `id`

```solidity
// id => cuenta => cuanto tiene
mapping(uint256 => mapping(address => uint256)) private _balances;
```

En ERC-20 hay un mapping `direccion => balance`. En ERC-721 hay un mapping `tokenId => dueno` (cada NFT tiene UN dueno). En ERC-1155 hay un mapping `id => direccion => cantidad`: cada `id` es como un "mini ERC-20" propio, todos viviendo en el mismo contrato.

Ejemplo tipico: un juego con un solo contrato que maneja `id 1 = monedas de oro` (fungible, miles de unidades), `id 2 = pociones` (fungible), e `id 3 = espada legendaria` (supply de 1, se comporta como un NFT).

## Todo se mueve en lote

La API de ERC-1155 esta pensada para operar sobre VARIOS ids a la vez:

```solidity
function balanceOfBatch(address[] calldata cuentas, uint256[] calldata ids) external view returns (uint256[] memory);

function safeBatchTransferFrom(
    address from, address to, uint256[] calldata ids, uint256[] calldata valores, bytes calldata datos
) external;
```

```ts
await nft.write.mintBatch([alice.account.address, [ID_ORO, ID_ESPADA], [50n, 2n]]);

await nft.write.safeBatchTransferFrom(
  [alice.account.address, bob.account.address, [ID_ORO, ID_ESPADA], [20n, 1n], "0x"],
  { account: alice.account },
);
```

Una sola transaccion mueve varios tipos de token distintos, en las cantidades que corresponda a cada uno. Esto ahorra gas frente a hacer una transferencia ERC-20 separada por cada tipo de item.

## Aprobaciones: solo `setApprovalForAll`

A diferencia de ERC-721 (que tiene aprobacion individual por `tokenId` ADEMAS de aprobacion global), ERC-1155 solo tiene aprobacion global:

```solidity
function setApprovalForAll(address operador, bool aprobado) external {
    _operadores[msg.sender][operador] = aprobado;
    emit ApprovalForAll(msg.sender, operador, aprobado);
}
```

No existe "aprobar 5 unidades del id 3 a esta direccion": o un operador tiene permiso sobre TODOS los ids y cantidades de una cuenta, o no tiene ninguno. Esto simplifica el estandar, pero significa que dar `setApprovalForAll` a un contrato (por ejemplo, un marketplace) le da acceso a TODA tu coleccion, no solo al item que querias vender.

## `safeTransferFrom` y el receptor

Igual que en ERC-721 (modulo 02, leccion 15), transferir a un contrato exige que ese contrato sepa recibir el estandar:

```solidity
function _verificarReceptorUno(address operador, address from, address to, uint256 id, uint256 valor, bytes calldata datos) internal {
    if (to.code.length == 0) return;

    try IERC1155ReceptorBasico(to).onERC1155Received(operador, from, id, valor, datos) returns (bytes4 respuesta) {
        if (respuesta != IERC1155ReceptorBasico.onERC1155Received.selector) revert ReceptorInvalido(to);
    } catch {
        revert ReceptorInvalido(to);
    }
}
```

ERC-1155 tiene DOS hooks de recepcion: `onERC1155Received` (para transferencias de un solo id) y `onERC1155BatchReceived` (para transferencias en lote). Un contrato que solo implementa uno de los dos puede recibir transferencias simples pero fallar en las de lote, o viceversa: si vas a recibir tokens ERC-1155 en un contrato propio, implementa ambos.

```ts
const receptor = await viem.deployContract("ReceptorERC1155");
await nft.write.safeTransferFrom([alice.account.address, receptor.address, ID_ORO, 5n, "0x"], { account: alice.account });
// funciona

const noReceptor = await viem.deployContract("NoReceptorERC1155");
await viem.assertions.revertWithCustomError(
  nft.write.safeTransferFrom([alice.account.address, noReceptor.address, ID_ORO, 5n, "0x"], { account: alice.account }),
  nft, "ReceptorInvalido",
);
```

## `TransferSingle` vs `TransferBatch`

```solidity
event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 valor);
event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] valores);
```

Aunque `mintBatch` mueve varios ids, emite UN solo `TransferBatch` (no varios `TransferSingle`). Las herramientas que indexan eventos (exploradores, marketplaces) tienen que manejar ambos formatos para llevar la cuenta correcta de balances.

## ERC-165: la misma idea que en ERC-721

```solidity
function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
    return interfaceId == 0x01ffc9a7 || interfaceId == 0xd9b67a26;
}
```

`0xd9b67a26` es el interface ID de ERC-1155 (el XOR de los selectores de sus funciones, modulo 02 leccion 04). Permite que otro contrato o marketplace pregunte "sos un ERC-1155?" antes de intentar interactuar.

## Cuando usar ERC-1155 en vez de ERC-20/ERC-721

- **Muchos tipos de item, con un mismo conjunto de mecanicas** (juegos: monedas, materiales, objetos, todos con transferencia/aprobacion/quema similares).
- **Ahorro de gas al desplegar**: un solo contrato ERC-1155 en vez de N contratos ERC-20/ERC-721 separados.
- **Transferencias en lote frecuentes**: si tu aplicacion mueve varios tipos de token juntos seguido, el ahorro de gas de las funciones batch es real.

Si solo necesitas un tipo de token fungible, ERC-20 sigue siendo mas simple. Si necesitas unicidad estricta con metadata individual rica por token, ERC-721 sigue siendo la opcion mas directa.

## Ejecutar el test

```bash
npx hardhat test test/16-ERC1155Basico.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ERC1155Basico.ts --network hardhatMainnet
```

## Errores comunes

### Dar `setApprovalForAll` sin entender el alcance

A diferencia de aprobar un `tokenId` puntual en ERC-721, esto da acceso a TODA la coleccion de todos los ids. Es el mismo riesgo que viste en ERC-20/ERC-721 del modulo 02, pero con un alcance mayor.

### Implementar solo uno de los dos hooks de recepcion

Un contrato receptor que solo tiene `onERC1155Received` va a fallar (o revertir) cuando alguien intente transferirle tokens con `safeBatchTransferFrom`.

### Longitudes de arrays que no coinciden en operaciones batch

Si `ids.length != valores.length`, la operacion no tiene sentido: este contrato lo valida explicitamente con `LongitudesNoCoinciden`, pero es un chequeo que hay que recordar agregar en cualquier implementacion.

## Ejercicios

1. Agrega una funcion `burnBatch` que destruya varios ids de una cuenta en una sola llamada.
2. Implementa un `id` que se comporte como semi-fungible: un supply maximo fijo por id (por ejemplo, maximo 100 unidades de la "espada legendaria"), rechazando mints que lo superen.
3. Escribe un contrato receptor que solo acepte transferencias de UN id especifico, rechazando cualquier otro (revirtiendo desde `onERC1155Received`).

## Resumen

- ERC-1155 maneja muchos tipos de token en un solo contrato, cada uno identificado por un `id`, con su propio balance por cuenta.
- Toda la API esta pensada para lotes: `balanceOfBatch`, `safeBatchTransferFrom`, con eventos `TransferBatch` dedicados.
- Solo existe aprobacion global (`setApprovalForAll`); no hay aprobacion individual por cantidad como en ERC-20.
- Un contrato receptor necesita implementar AMBOS hooks (`onERC1155Received` y `onERC1155BatchReceived`) para aceptar transferencias simples y en lote.
