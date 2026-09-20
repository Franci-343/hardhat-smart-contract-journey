# 02 - Solidity Intermedio

Este modulo continua despues de `01-fundamentos-solidity`. Aqui el estudiante ya deberia saber compilar, ejecutar tests, desplegar en una red local simulada y entender los conceptos base de Solidity.

La diferencia importante: en este modulo ya se trabaja pensando en una wallet de pruebas, Sepolia, contratos que interactuan entre si y patrones mas cercanos a proyectos reales.

## Requisitos previos

Antes de empezar, deberias poder:

- Ejecutar `npm test` en `01-fundamentos-solidity`.
- Entender `msg.sender`, `msg.value`, `payable`, eventos y errores.
- Desplegar contratos en `hardhatMainnet`.
- Usar una wallet de pruebas, como MetaMask.
- Tener claro que nunca se suben claves privadas ni seed phrases.

## Instalacion

Desde esta carpeta:

```bash
npm install
```

## Configuracion de wallet y Sepolia

Este modulo incluye una plantilla `.env.example`.

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
```

Usa una wallet exclusiva para pruebas. No uses tu wallet principal.

## Comandos principales

Compilar:

```bash
npm run compile
```

Mientras los contratos esten vacios, Hardhat puede mostrar warnings por falta de `SPDX-License-Identifier` y `pragma solidity`. Eso es esperado en esta fase de preparacion. Cuando Claude Code complete cada contrato, esos warnings deberian desaparecer.

Ejecutar tests:

```bash
npm test
```

Desplegar el primer modulo de Ignition en local:

```bash
npm run deploy:local
```

Desplegar en Sepolia:

```bash
npm run deploy:sepolia
```

Los despliegues de Ignition funcionaran cuando el modulo correspondiente tenga contenido. Por ahora, los archivos estan preparados como placeholders vacios para que las lecciones se completen progresivamente.

## Estructura

```text
02-solidity-intermedio/
  contracts/          Contratos Solidity intermedios
  docs/               Lecciones del modulo
  ignition/modules/   Modulos de despliegue con Hardhat Ignition
  scripts/            Scripts de despliegue e interaccion
  test/               Tests del modulo
  .env.example        Plantilla para Sepolia
```

## Ruta del modulo

### Solidity intermedio

1. Herencia.
2. Constructores con herencia y `super`.
3. Contratos abstractos.
4. Interfaces.
5. Librerias.
6. Modifiers avanzados.
7. `constant` e `immutable`.
8. `storage`, `memory` y `calldata`.
9. Llamadas entre contratos.
10. Low-level calls.
11. `try/catch`.
12. Control de acceso.
13. Ownable y pausas de emergencia.
14. ERC-20 basico.
15. ERC-721 basico.
16. Oraculos e interfaces externas.

### Wallet, testnet y flujo real

Este modulo tambien debe reforzar:

- Uso de MetaMask con una wallet de pruebas.
- Despliegue en Sepolia.
- Lectura del contrato en Etherscan.
- Verificacion de contratos.
- Separacion entre desarrollo local, testnet y mainnet.

## Archivos preparados

Los archivos numerados en `contracts/`, `test/`, `ignition/modules/`, `scripts/` y `docs/` estan vacios a proposito. La idea es que se llenen uno por uno durante el desarrollo del modulo.

## Seguridad

- Nunca pegues tu seed phrase en ningun archivo.
- Nunca subas `.env`.
- Usa una cuenta de pruebas para Sepolia.
- Revisa la red en MetaMask antes de firmar.
- Confirma en Etherscan que estas usando Sepolia, no mainnet.
