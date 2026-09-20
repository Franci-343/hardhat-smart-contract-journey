# Hardhat Smart Contract Journey

Repositorio de aprendizaje para desarrollar smart contracts en Ethereum. El objetivo es recorrer dos caminos completos, de cero a avanzado:

1. **Solidity**: el lenguaje de los smart contracts.
2. **Hardhat**: el entorno para compilar, probar, desplegar y depurar esos contratos.

Cada modulo es una carpeta numerada. Se recomienda avanzarlos en orden.

## Estado de los modulos

Leyenda: `[x]` disponible, `[ ]` planificado.

| Modulo | Estado | Tema |
| --- | --- | --- |
| `00-fundamentos-blockchain` | `[x]` | Conceptos base de blockchain y Ethereum |
| `01-fundamentos-solidity` | `[x]` | Solidity basico + primer contacto con Hardhat, local y Sepolia |
| `02-solidity-intermedio` | `[ ]` | Herencia, interfaces, librerias, modifiers y estandares |
| `03-solidity-avanzado` | `[ ]` | Seguridad, gas, assembly, proxies y patrones avanzados |
| `04-hardhat-fundamentos` | `[ ]` | Hardhat 3 a fondo: configuracion, tareas, tests y redes |
| `05-hardhat-intermedio` | `[ ]` | Fork de mainnet, Ignition, verificacion y depuracion |
| `06-hardhat-avanzado` | `[ ]` | Plugins propios, CI/CD, proyectos reales y flujo de produccion |

Los temas de los modulos planificados son una propuesta y pueden ajustarse a medida que avance el curso.

## Modulos disponibles

### 00 - Fundamentos de blockchain

Teoria en Markdown, sin codigo. Orden de lectura sugerido:

1. [Ethereum](00-fundamentos-blockchain/ethereum.md)
2. [Wallets](00-fundamentos-blockchain/wallets.md)
3. [Transacciones](00-fundamentos-blockchain/transacciones.md)
4. [Gas](00-fundamentos-blockchain/gas.md)
5. [EVM](00-fundamentos-blockchain/evm.md)
6. [Redes](00-fundamentos-blockchain/redes.md)
7. [Tokens](00-fundamentos-blockchain/tokens.md)
8. [Terminologia](00-fundamentos-blockchain/terminologia.md): glosario para consultar cuando aparezca un termino nuevo.

### 01 - Fundamentos de Solidity

Proyecto Hardhat 3 con Solidity 0.8.34, Mocha, Chai y Ethers. Ver el [README del modulo](01-fundamentos-solidity/README.md).

- **16 contratos** en `contracts/`: HelloWorld, variables, tipos de datos, funciones, visibilidad, condicionales, loops, arrays, mappings, structs, enums, eventos, errores, require/assert/revert, payable y receive/fallback.
- **Un test por contrato** en `test/`.
- **Despliegues** con scripts (`scripts/`) y modulos de Hardhat Ignition (`ignition/modules/`).
- **12 lecciones** en `docs/`, de `00-que-es-solidity` a `11-verificar-contrato-en-etherscan`. Cubren Solidity y Hardhat basico, trabajo en local, wallets y MetaMask, despliegue en Sepolia y Etherscan.

Este modulo mezcla Solidity basico con una introduccion practica a Hardhat. Los modulos de Hardhat (04 a 06) profundizaran en lo que aqui solo se ve por encima.

## Ruta de aprendizaje

### Camino Solidity (00 a 03)

- **Basico (01)**: sintaxis, tipos, estructuras de datos, eventos, errores y pagos con Ether. *Completo.*
- **Intermedio (02)**: herencia, interfaces, clases abstractas, librerias, modifiers, `immutable`/`constant`, llamadas entre contratos, ERC-20 y ERC-721, OpenZeppelin, oraculos.
- **Avanzado (03)**: vulnerabilidades comunes (reentrancy, control de acceso, overflow, front-running), optimizacion de gas, layout de storage, assembly/Yul, `delegatecall`, proxies y contratos actualizables, ERC-4626, `CREATE2`, auditoria.

### Camino Hardhat (04 a 06)

- **Fundamentos (04)**: estructura del proyecto, `hardhat.config.ts`, perfiles de compilacion, redes, tests con TypeScript y con Solidity, `networkHelpers`.
- **Intermedio (05)**: fork de mainnet, Hardhat Ignition avanzado, variables de configuracion y secretos, verificacion en Etherscan, reportes de gas y cobertura, depuracion con trazas.
- **Avanzado (06)**: plugins y tareas propias, monorepo, integracion continua, despliegues multi-red, proyecto final de punta a punta.

## Empezar

Requisitos: Node.js y npm. No hace falta wallet ni ETH real hasta que llegues a las lecciones de Sepolia.

```bash
cd 01-fundamentos-solidity
npm install
npx hardhat compile
npx hardhat test
```

## Convenciones del repositorio

- Cada modulo es un proyecto independiente con su propio `package.json`. Se instala y se ejecuta desde su carpeta.
- Los modulos de contenido usan prefijo numerico (`NN-nombre`).
- Cada modulo con codigo tiene su propio `README.md`. Las explicaciones viven en `docs/` o en archivos `.md` de la carpeta.
- Los contratos y sus tests comparten numero (`08-Arrays.sol` y `08-Arrays.ts`).

## Seguridad

Nunca subas claves privadas, seed phrases ni archivos `.env` con credenciales. Usa una wallet exclusiva para pruebas y ETH de testnet. Cada modulo que necesite variables de entorno incluye un `.env.example` como plantilla.
