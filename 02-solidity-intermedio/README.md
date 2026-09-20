# 02 - Solidity Intermedio

Este modulo continua despues de `01-fundamentos-solidity`. Aqui el estudiante ya deberia saber compilar, ejecutar tests, desplegar en una red local simulada y entender los conceptos base de Solidity.

La diferencia importante: en este modulo ya se trabaja pensando en una wallet de pruebas, Sepolia, contratos que interactuan entre si y patrones mas cercanos a proyectos reales.

## Que aprenderas

Al finalizar este modulo deberias poder:

- Reutilizar codigo con herencia, contratos abstractos, interfaces y librerias.
- Escribir modifiers avanzados y protegerte de la reentrada.
- Elegir entre `constant`, `immutable` y variables de storage, y entre `storage`, `memory` y `calldata`.
- Hacer llamadas entre contratos, llamadas de bajo nivel y capturar fallos con `try/catch`.
- Controlar el acceso con roles, `Ownable` y pausas de emergencia.
- Entender por dentro un token ERC-20 y un NFT ERC-721.
- Consumir un oraculo de precios y validar sus datos.
- Desplegar en Sepolia con una wallet de pruebas y verificar el contrato en Etherscan.

## Requisitos previos

Antes de empezar, deberias poder:

- Ejecutar `npm test` en `01-fundamentos-solidity`.
- Entender `msg.sender`, `msg.value`, `payable`, eventos y errores.
- Desplegar contratos en `hardhatMainnet`.
- Usar una wallet de pruebas, como MetaMask.
- Tener claro que nunca se suben claves privadas ni seed phrases.

## Diferencia con el modulo 01

El modulo 01 usa **ethers + Mocha + Chai**. Este modulo usa **viem + `node:test`** (`@nomicfoundation/hardhat-toolbox-viem`). Los tests y scripts se escriben con `contrato.read.funcion()` / `contrato.write.funcion()` y numeros `bigint`. La leccion [00](docs/00-introduccion-solidity-intermedio.md) explica la equivalencia.

## Instalacion

Desde esta carpeta:

```bash
npm install
```

## Comandos principales

Compilar:

```bash
npm run compile
```

Debe terminar con `Compiled 16 Solidity files` y sin warnings.

Ejecutar todos los tests:

```bash
npm test
```

Resultado esperado:

```text
108 passing
```

Ejecutar el test de un solo contrato:

```bash
npx hardhat test test/06-ModifiersAvanzados.ts
```

Comprobar los tipos de TypeScript (tests, scripts y modulos de Ignition):

```bash
npm run typecheck
```

Desplegar el primer modulo de Ignition en local:

```bash
npm run deploy:local
```

Desplegar el primer modulo de Ignition en Sepolia (requiere `.env`, ver abajo):

```bash
npm run deploy:sepolia
```

Desplegar cualquier otro contrato:

```bash
# Ignition (cambia el numero por el modulo que quieras)
npx hardhat ignition deploy ignition/modules/14-ERC20Basico.ts --network hardhatMainnet

# Script con viem
npx hardhat run scripts/deploy-ERC20Basico.ts --network hardhatMainnet
```

Para Sepolia cambia `--network hardhatMainnet` por `--network sepolia`.

## Configuracion de wallet y Sepolia

Este modulo incluye una plantilla `.env.example`. No necesitas wallet ni `.env` para compilar, probar ni desplegar en local: solo para Sepolia.

Copiala como `.env`:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Luego abre `.env` y reemplaza los valores:

```text
SEPOLIA_RPC_URL=https://tu-rpc-de-sepolia
SEPOLIA_PRIVATE_KEY=0xTU_PRIVATE_KEY_DE_PRUEBAS
ETHERSCAN_API_KEY=TU_API_KEY_DE_ETHERSCAN
```

`ETHERSCAN_API_KEY` solo hace falta para verificar contratos (leccion 18).

Usa una wallet exclusiva para pruebas. No uses tu wallet principal. Todo el flujo esta explicado paso a paso en las lecciones [17](docs/17-wallet-sepolia-flujo-real.md) y [18](docs/18-etherscan-y-verificacion.md).

## Estructura

```text
02-solidity-intermedio/
  contracts/          16 contratos Solidity intermedios
  docs/               20 lecciones del modulo (00 a 19)
  ignition/modules/   Un modulo de despliegue con Hardhat Ignition por contrato
  scripts/            Un script de despliegue con viem por contrato
  test/               Un test por contrato (viem + node:test)
  .env.example        Plantilla para Sepolia y Etherscan
```

Los contratos y sus tests comparten numero (`06-ModifiersAvanzados.sol` y `06-ModifiersAvanzados.ts`). Los scripts usan el nombre del contrato (`scripts/deploy-ModifiersAvanzados.ts`).

## Ruta del modulo

Lee las lecciones en orden. Cada una explica su contrato, su test y como desplegarlo.

### Solidity intermedio

| # | Leccion | Contrato | Que practicas |
| --- | --- | --- | --- |
| 00 | [Introduccion](docs/00-introduccion-solidity-intermedio.md) | | Mapa del modulo, viem vs ethers |
| 01 | [Herencia](docs/01-herencia.md) | `01-Herencia.sol` | `is`, `virtual`, `override`, herencia multiple |
| 02 | [Constructores y `super`](docs/02-constructores-y-super.md) | `02-ConstructoresHerencia.sol` | Argumentos al padre, orden de constructores |
| 03 | [Contratos abstractos](docs/03-contratos-abstractos.md) | `03-ContratosAbstractos.sol` | `abstract`, plantillas |
| 04 | [Interfaces](docs/04-interfaces.md) | `04-Interfaces.sol` | `interface`, `interfaceId` |
| 05 | [Librerias](docs/05-librerias.md) | `05-Librerias.sol` | `library`, `using for` |
| 06 | [Modifiers avanzados](docs/06-modifiers-avanzados.md) | `06-ModifiersAvanzados.sol` | Parametros, orden, reentrada |
| 07 | [`constant` e `immutable`](docs/07-constant-immutable.md) | `07-ConstantImmutable.sol` | Ahorro de gas |
| 08 | [`storage`, `memory`, `calldata`](docs/08-storage-memory-calldata.md) | `08-StorageMemoryCalldata.sol` | Ubicaciones de datos |
| 09 | [Llamadas entre contratos](docs/09-llamadas-entre-contratos.md) | `09-LlamadasEntreContratos.sol` | `msg.sender` vs `tx.origin`, `new` |
| 10 | [Llamadas de bajo nivel](docs/10-low-level-call.md) | `10-LowLevelCall.sol` | `call`, `staticcall`, selectores |
| 11 | [`try/catch`](docs/11-try-catch.md) | `11-TryCatch.sol` | `Error`, `Panic`, errores personalizados |
| 12 | [Control de acceso](docs/12-access-control.md) | `12-AccessControl.sol` | Roles (RBAC) |
| 13 | [Ownable y pausas](docs/13-ownable-pausable.md) | `13-OwnablePausable.sol` | Propiedad en dos pasos, pausa |
| 14 | [ERC-20 basico](docs/14-erc20-basico.md) | `14-ERC20Basico.sol` | Tokens fungibles, `approve` |
| 15 | [ERC-721 basico](docs/15-erc721-basico.md) | `15-ERC721Basico.sol` | NFTs, `safeTransferFrom`, ERC-165 |
| 16 | [Oraculos e interfaces externas](docs/16-oraculos-interfaces-externas.md) | `16-OraculosInterfacesExternas.sol` | Chainlink, datos obsoletos |

### Wallet, testnet y flujo real

| # | Leccion | Que practicas |
| --- | --- | --- |
| 17 | [Wallet, Sepolia y flujo real](docs/17-wallet-sepolia-flujo-real.md) | MetaMask, faucet, RPC, despliegue en Sepolia |
| 18 | [Etherscan y verificacion](docs/18-etherscan-y-verificacion.md) | Leer y verificar contratos, Read/Write Contract |
| 19 | [Checklist de seguridad](docs/19-checklist-seguridad-intermedia.md) | Revision antes de desplegar |

Este modulo tambien refuerza:

- Uso de MetaMask con una wallet de pruebas.
- Despliegue en Sepolia.
- Lectura del contrato en Etherscan.
- Verificacion de contratos.
- Separacion entre desarrollo local, testnet y mainnet.

## Sobre OpenZeppelin

Los contratos de Ownable, roles, ERC-20 y ERC-721 estan escritos **a mano** para que entiendas que hay dentro. En proyectos reales usa [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts), que esta auditado. Cada leccion indica el equivalente.

## Seguridad

- Nunca pegues tu seed phrase en ningun archivo.
- Nunca subas `.env`.
- Usa una cuenta de pruebas para Sepolia.
- Revisa la red en MetaMask antes de firmar.
- Confirma en Etherscan que estas usando Sepolia, no mainnet.
- Los contratos de este modulo son **didacticos**: no los uses con fondos reales sin una auditoria.
