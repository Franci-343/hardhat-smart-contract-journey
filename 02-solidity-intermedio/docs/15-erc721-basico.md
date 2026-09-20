# 15 - ERC-721 basico

ERC-721 es el estandar de **tokens no fungibles (NFT)**. A diferencia de un ERC-20, aqui cada token es **unico** y tiene su propio dueno.

Archivos de esta leccion:

- `contracts/15-ERC721Basico.sol`
- `test/15-ERC721Basico.ts`
- `ignition/modules/15-ERC721Basico.ts`
- `scripts/deploy-ERC721Basico.ts`

## ERC-20 vs ERC-721

| | ERC-20 | ERC-721 |
| --- | --- | --- |
| Tipo | Fungible | No fungible |
| Que se guarda | Saldo por direccion | Dueno por `tokenId` |
| Unidad minima | Divisible (18 decimales) | Indivisible (1 token) |
| Ejemplos | USDC, UNI | Coleccionables, entradas, nombres ENS |

En un ERC-20, `balances[alice] = 100`. En un ERC-721:

```solidity
mapping(uint256 => address) private _duenos;   // tokenId => dueno
mapping(address => uint256) private _balances; // dueno   => cuantos NFT tiene
```

Nota: `balanceOf` cuenta **cuantos** NFTs tiene una direccion, no cuales.

## Las funciones del estandar

```solidity
function balanceOf(address owner) external view returns (uint256);
function ownerOf(uint256 tokenId) external view returns (address);
function transferFrom(address from, address to, uint256 tokenId) external;
function safeTransferFrom(address from, address to, uint256 tokenId) external;
function approve(address to, uint256 tokenId) external;
function setApprovalForAll(address operator, bool approved) external;
function getApproved(uint256 tokenId) external view returns (address);
function isApprovedForAll(address owner, address operator) external view returns (bool);
```

Y tres eventos: `Transfer`, `Approval` y `ApprovalForAll`.

## Crear un NFT

```solidity
function mint(address to, string calldata uri) external soloOwner returns (uint256) {
    return _mint(to, uri);
}

function _mint(address to, string calldata uri) internal returns (uint256 tokenId) {
    tokenId = _siguienteId++;
    _duenos[tokenId] = to;
    _uris[tokenId] = uri;
    _balances[to] += 1;

    emit Transfer(address(0), to, tokenId);
}
```

Los `tokenId` son consecutivos (`0`, `1`, `2`...). El evento `Transfer` desde `address(0)` es la convencion para indicar creacion (igual que en ERC-20).

## Metadata y `tokenURI`

Un NFT en la blockchain es solo un numero y un dueno. La imagen, el nombre y las propiedades **no viven en la cadena** (seria carisimo): se guardan en un archivo JSON al que apunta `tokenURI(tokenId)`.

```json
{
  "name": "Mi NFT #0",
  "description": "Primer NFT del curso",
  "image": "ipfs://Qm.../0.png",
  "attributes": [{ "trait_type": "Color", "value": "Azul" }]
}
```

Ese JSON suele estar en **IPFS** (almacenamiento direccionado por contenido: cambiar el archivo cambia su direccion) o en un servidor tradicional.

**Aviso:** si la URI apunta a un servidor que puede cambiar el archivo, el "dueno" del NFT no controla realmente lo que ve. Los proyectos serios usan IPFS o Arweave.

En este contrato cada token guarda su propia URI (`_uris[tokenId]`). Otros contratos guardan una URI base y le agregan el `tokenId`.

## Aprobaciones

Como en ERC-20, un tercero puede mover tus NFTs solo con permiso. Hay dos niveles:

| Funcion | Permite |
| --- | --- |
| `approve(to, tokenId)` | A `to` mover **ese** token |
| `setApprovalForAll(operador, true)` | A `operador` mover **todos** tus tokens |

La aprobacion individual se **borra al transferir**:

```solidity
delete _aprobados[tokenId];
```

Esto evita que un permiso viejo siga vigente con un nuevo dueno. El test lo comprueba.

`setApprovalForAll` es lo que usan los mercados de NFTs (OpenSea y similares): al listarlos, les das permiso sobre toda tu coleccion. Es comodo y tambien un objetivo comun de estafas: nunca apruebes a un sitio que no reconoces.

## `transferFrom` vs `safeTransferFrom`

Ambos mueven el NFT, pero:

- `transferFrom`: mueve el token a **cualquier** direccion, incluso a un contrato que no sabe manejar NFTs. Si eso pasa, el NFT queda **atrapado para siempre**.
- `safeTransferFrom`: si el destino es un **contrato**, primero le pregunta si sabe recibir NFTs.

```solidity
function _verificarReceptor(address from, address to, uint256 tokenId, bytes memory data) internal {
    if (to.code.length == 0) return;   // una cuenta normal siempre puede recibir

    try IERC721ReceptorBasico(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 respuesta) {
        if (respuesta != IERC721ReceptorBasico.onERC721Received.selector) revert ReceptorInvalido(to);
    } catch {
        revert ReceptorInvalido(to);
    }
}
```

Reconoces aqui el `try/catch` de la leccion 11. El contrato receptor debe implementar `onERC721Received` y devolver un valor magico (su propio selector). Si no lo hace o revierte, la transferencia falla.

El archivo incluye dos contratos para probarlo:

- `ReceptorNFT`: implementa `onERC721Received`, recibe sin problema.
- `NoReceptorNFT`: no lo implementa, `safeTransferFrom` revierte con `ReceptorInvalido`.

El test incluye un caso que muestra el peligro real: con `transferFrom` a `NoReceptorNFT` el NFT llega y queda atrapado.

`safeTransferFrom` tiene dos versiones (con y sin `data`). Solidity permite sobrecargar funciones con distintos parametros, y viem elige la correcta segun los argumentos que pases.

**Ojo:** `safeTransferFrom` hace una llamada externa a `to`, asi que puede abrir la puerta a **reentrada** (leccion 06). Actualiza el estado antes, como hace este contrato.

## ERC-165: preguntar que interfaces soporta un contrato

```solidity
function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
    return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd || interfaceId == 0x5b5e139f;
}
```

| ID | Interfaz |
| --- | --- |
| `0x01ffc9a7` | ERC-165 |
| `0x80ac58cd` | ERC-721 |
| `0x5b5e139f` | ERC-721 Metadata |

Es la aplicacion practica de `type(I).interfaceId` de la leccion 04. Mercados y wallets llaman a `supportsInterface(0x80ac58cd)` para saber si una direccion es un NFT.

## Destruir un NFT

```solidity
function burn(uint256 tokenId) external { ... }
```

Borra al dueno, la URI y las aprobaciones, y emite `Transfer(dueno, address(0), tokenId)`. Despues, `ownerOf` revierte con `TokenInexistente`.

## Este contrato vs OpenZeppelin

```solidity
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
```

`ERC721`, `ERC721URIStorage`, `ERC721Enumerable` (para listar los tokens de un dueno) y `ERC721Burnable` cubren todo esto y mas. Usalos siempre en produccion.

Para tokens que combinan fungibles y no fungibles (items de un juego), existe ERC-1155.

## Ejecutar el test

```bash
npx hardhat test test/15-ERC721Basico.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ERC721Basico.ts --network hardhatMainnet
```

El script mintea el token `0` a quien despliega. En Sepolia, puedes ver el NFT en Etherscan (pestana **Token Transfers (ERC-721)**) y agregarlo a MetaMask.

## Errores comunes

### Usar `transferFrom` hacia contratos

Puede atrapar el NFT. Prefiere `safeTransferFrom` cuando el destino pueda ser un contrato.

### Olvidar borrar la aprobacion al transferir

Dejaria a un tercero con permiso sobre un token que ya no es del mismo dueno.

### Metadata en un servidor que cambia

El NFT deja de mostrar lo que el comprador vio.

### Suponer que `balanceOf` lista los tokens

Solo devuelve una cuenta. Para listarlos hace falta `ERC721Enumerable` o indexar los eventos `Transfer`.

## Ejercicios

1. Agrega un limite maximo de NFTs (`MAX_SUPPLY`) y un `mint` publico de pago (`payable`, modulo 01: `15-Payable.sol`).
2. Agrega un evento `MetadataActualizada` y una funcion para cambiar la URI de un token solo por el owner.
3. Implementa `tokensDe(address)` recorriendo los ids del 0 al `totalMinteados()` (y comenta por que no escala).

## Resumen

- ERC-721 = tokens unicos: se guarda el dueno de cada `tokenId`.
- La metadata vive fuera de la cadena y se referencia con `tokenURI`.
- `safeTransferFrom` protege de enviar NFTs a contratos que no los saben recibir.
- `supportsInterface` (ERC-165) permite descubrir que estandares cumple un contrato.
- En produccion, usa OpenZeppelin.
