# 03 - Solidity Avanzado

Este modulo continua despues de `02-solidity-intermedio`. Aqui el estudiante ya deberia saber herencia, interfaces, librerias, modifiers, `try/catch`, control de acceso por roles, y ERC-20/ERC-721 basicos.

La diferencia importante: en este modulo se trabaja con **vulnerabilidades reales** (no solo teoria), **patrones de gas y storage** a nivel de bytes, y las primitivas mas avanzadas del ecosistema (proxies, `delegatecall`, `CREATE2`, firmas EIP-712, manipulacion de oraculos con flash loans).

## Que aprenderas

Al finalizar este modulo deberias poder:

- Explotar y corregir reentrancy (misma funcion y cruzada entre funciones).
- Identificar vulnerabilidades de control de acceso, incluido el uso incorrecto de `tx.origin`.
- Entender donde `unchecked` ahorra gas de forma segura, y donde abre un bug.
- Explotar front-running y defenderte con commit-reveal.
- Empaquetar structs para ahorrar slots de storage, y medir el ahorro en gas real.
- Leer storage crudo y calcular donde vive un elemento de un array o el valor de un mapping.
- Escribir assembly (Yul) donde de verdad hace falta, y reconocer cuando no.
- Entender `delegatecall` a fondo: colision de storage y preservacion de contexto.
- Construir un proxy minimo (EIP-1967) y un contrato actualizable UUPS.
- Desplegar clones minimos (EIP-1167) y predecir direcciones con `CREATE2`.
- Verificar firmas EIP-712 on-chain, para meta-transacciones sin gas para el firmante.
- Construir un vault ERC-4626 y defenderlo del ataque de inflacion del primer deposito.
- Construir un token multi-tipo ERC-1155.
- Auditar un contrato con un checklist completo, y explicar el ataque de manipulacion de oraculos con flash loans.

## Requisitos previos

- Todo el modulo `02-solidity-intermedio` (herencia, interfaces, librerias, `try/catch`, roles, ERC-20/721, oraculos).
- Comodidad leyendo Solidity y TypeScript con viem (los mismos patrones del modulo 02).

## Como esta construido este modulo

Cada leccion sigue, cuando aplica, el mismo patron: **version vulnerable -> el ataque -> version corregida**, todo probado con un test que se ejecuta de verdad. Varias afirmaciones tecnicas (los slots de EIP-1967, el bytecode de EIP-1167, el separador de dominio de EIP-712) estan verificadas comparando el resultado del contrato contra una implementacion independiente (por ejemplo, `getCreate2Address` de viem), no solo descritas.

**Advertencia:** los contratos "vulnerables" de este modulo son deliberadamente inseguros, con fines didacticos. Nunca los uses como base de un proyecto real.

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

Ejecutar todos los tests:

```bash
npm test
```

Resultado esperado:

```text
79 passing
```

Ejecutar el test de una sola leccion:

```bash
npx hardhat test test/01-Reentrancy.ts
```

Comprobar los tipos de TypeScript:

```bash
npm run typecheck
```

Desplegar el primer modulo de Ignition en local:

```bash
npm run deploy:local
```

Ver una leccion en accion, con numeros reales:

```bash
npx hardhat run scripts/deploy-Reentrancy.ts --network hardhatMainnet
```

Para cualquier otra leccion, cambia el nombre del script o del modulo de Ignition:

```bash
npx hardhat ignition deploy ignition/modules/15-ManipulacionOraculo.ts --network hardhatMainnet
npx hardhat run scripts/deploy-ManipulacionOraculo.ts --network hardhatMainnet
```

## Configuracion de wallet y Sepolia

Igual que en el modulo 02: no necesitas wallet ni `.env` para compilar, probar ni desplegar en local. Solo hace falta para Sepolia:

```bash
cp .env.example .env
```

```powershell
Copy-Item .env.example .env
```

```text
SEPOLIA_RPC_URL=https://tu-rpc-de-sepolia
SEPOLIA_PRIVATE_KEY=0xTU_PRIVATE_KEY_DE_PRUEBAS
ETHERSCAN_API_KEY=TU_API_KEY_DE_ETHERSCAN
```

Usa una wallet exclusiva para pruebas.

### Correr los scripts en Sepolia (no solo en local)

Todos los scripts de despliegue funcionan igual en Sepolia que en local, con una sola cuenta configurada (`SEPOLIA_PRIVATE_KEY`). Varias lecciones (reentrancy, firmas EIP-712) necesitan una segunda cuenta para el rol de "victima", "destino" o "relayer"; en vez de pedirte una segunda clave privada, esos scripts **generan y fondean esa cuenta en el momento**, desde tu cuenta principal, usando una transferencia normal. Es la misma tecnica que usarias para crear cuentas de prueba desde un script propio.

Los montos de ETH que usan los scripts son chicos a proposito (centesimos de ETH, no ETH enteros): con lo que da un solo faucet de Sepolia alcanza para correr cualquiera de ellos. Ejemplo:

```bash
npx hardhat run scripts/deploy-Reentrancy.ts --network sepolia
```

Una excepcion conceptual: el script de la leccion 04 (front-running) demuestra el **efecto** de copiar una transaccion y llegar primero, pero no reproduce una carrera real de mempool con gas de por medio (ver la nota en `docs/04-front-running.md`). Para eso harian falta dos transacciones realmente pendientes al mismo tiempo, algo que este script no automatiza.

## Estructura

```text
03-solidity-avanzado/
  contracts/          17 archivos, uno por leccion (varios contratos por archivo)
  docs/               18 lecciones (00 a 17)
  ignition/modules/   Un modulo de despliegue con Hardhat Ignition por leccion
  scripts/            Un script de demostracion con viem por leccion
  test/               Un test por leccion (79 tests en total)
  .env.example        Plantilla para Sepolia y Etherscan
```

## Ruta del modulo

| # | Leccion | Contrato | Que practicas |
| --- | --- | --- | --- |
| 00 | [Introduccion](docs/00-introduccion-solidity-avanzado.md) | | Mapa del modulo |
| 01 | [Reentrancy a fondo](docs/01-reentrancy.md) | `01-Reentrancy.sol` | Misma funcion, cruzada, y correccion |
| 02 | [Vulnerabilidades de control de acceso](docs/02-vulnerabilidades-control-de-acceso.md) | `02-AccessControlVulnerable.sol` | Falta de proteccion, `tx.origin` |
| 03 | [Aritmetica y `unchecked`](docs/03-aritmetica-unchecked.md) | `03-AritmeticaUnchecked.sol` | Overflow/underflow silencioso, truncamiento |
| 04 | [Front-running y commit-reveal](docs/04-front-running.md) | `04-FrontRunning.sol` | Mempool, commit-reveal |
| 05 | [Gas I: empaquetado de storage](docs/05-gas-packing-storage.md) | `05-GasPackingStorage.sol` | Slots, orden de campos |
| 06 | [Gas II: patrones de codigo](docs/06-gas-patrones.md) | `06-GasPatrones.sol` | Cache de loops, cortocircuito, bytecode |
| 07 | [Layout de storage](docs/07-storage-layout.md) | `07-StorageLayout.sol` | Herencia, arrays, mappings, lectura cruda |
| 08 | [Assembly / Yul](docs/08-assembly-yul.md) | `08-AssemblyYul.sol` | `.slot`, `.offset`, `sload`, `calldataload` |
| 09 | [`delegatecall` a fondo](docs/09-delegatecall.md) | `09-Delegatecall.sol` | Colision de storage, contexto preservado |
| 10 | [Proxies minimos (EIP-1967)](docs/10-proxy-minimo.md) | `10-ProxyMinimo.sol` | `fallback()`, slot de implementacion |
| 11 | [Contratos actualizables (UUPS)](docs/11-proxy-actualizable-uups.md) | `11-ProxyActualizable.sol` | `initialize()`, layout entre versiones |
| 12 | [Clones minimos y `CREATE2`](docs/12-clones-create2.md) | `12-ClonesCreate2.sol` | EIP-1167, direcciones deterministicas |
| 13 | [Firmas EIP-712](docs/13-firmas-eip712.md) | `13-FirmasEIP712.sol` | Dominio, `ecrecover`, meta-transacciones |
| 14 | [ERC-4626: bovedas tokenizadas](docs/14-erc4626-basico.md) | `14-ERC4626Basico.sol` | Vaults, ataque de inflacion |
| 15 | [Manipulacion de oraculos y flash loans](docs/15-manipulacion-oraculos-flash-loans.md) | `15-ManipulacionOraculo.sol` | AMM, flash loans, precio spot |
| 16 | [ERC-1155: multi-token](docs/16-erc1155-basico.md) | `16-ERC1155Basico.sol` | Balances por id, operaciones en lote |
| 17 | [Checklist de auditoria](docs/17-checklist-auditoria.md) | `17-ChecklistAuditoria.sol` | Capstone: encontrar 5 bugs |

## Sobre las herramientas de auditoria

Este modulo no instala Slither, Foundry, Echidna ni Mythril: son herramientas externas al ecosistema de Hardhat, con instalacion especifica por sistema operativo. La leccion 17 las explica conceptualmente.

## Seguridad

- Los contratos vulnerables de este modulo son **material didactico**. Nunca los uses con fondos reales.
- Nunca subas `.env`, claves privadas ni seed phrases.
- Usa una cuenta de pruebas para Sepolia.
