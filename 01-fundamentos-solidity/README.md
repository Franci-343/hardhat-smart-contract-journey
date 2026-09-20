# 01 - Fundamentos de Solidity

Bienvenido al modulo **Fundamentos de Solidity**.

Este modulo esta pensado para aprender Solidity desde cero usando Hardhat como entorno de trabajo. La idea es que no solo leas teoria: vas a compilar contratos, ejecutar tests, desplegar en local y preparar el camino para Sepolia.

## Que aprenderas

Al finalizar este modulo deberias poder:

- Entender que es Solidity y que problema resuelve.
- Entender que es Hardhat y como se organiza un proyecto.
- Crear contratos inteligentes basicos.
- Compilar contratos con Hardhat.
- Escribir y ejecutar pruebas automaticas.
- Desplegar contratos en una red local simulada.
- Usar scripts e Ignition para despliegues.
- Comprender variables, funciones, visibilidad, arrays, mappings, structs, enums, eventos, errores y pagos con Ether.

## Estructura

```text
01-fundamentos-solidity/
  contracts/          Contratos Solidity del curso
  docs/               Explicaciones paso a paso
  ignition/modules/   Modulos de despliegue con Hardhat Ignition
  scripts/            Scripts de despliegue e interaccion
  test/               Tests automaticos con Mocha, Chai y Ethers
```

## Instalacion

Desde esta carpeta:

```bash
npm install
```

No necesitas MetaMask ni una wallet real para esta etapa. Hardhat usa cuentas locales de prueba con ETH falso cuando ejecutas tests o despliegues en `hardhatMainnet`.

## Comandos principales

Compilar:

```bash
npx hardhat compile
```

Tambien puedes usar:

```bash
npm run compile
```

Si ves `No contracts to compile`, no es un error. Significa que Hardhat ya compilo esos contratos antes y no detecto cambios nuevos.

Ejecutar tests:

```bash
npx hardhat test
```

Tambien puedes usar:

```bash
npm test
```

Resultado esperado:

```text
43 passing
```

Desplegar todos los contratos en la red local simulada:

```bash
npx hardhat run scripts/deploy-all.ts --network hardhatMainnet
```

Tambien puedes usar:

```bash
npm run deploy:all
```

Resultado esperado: una lista de contratos con direcciones `0x...`.

Esas direcciones son locales y temporales. Sirven para confirmar que el despliegue funciona, pero no estan en Sepolia ni en Ethereum mainnet.

Desplegar ejemplos puntuales:

```bash
npx hardhat run scripts/deploy-hello-world.ts --network hardhatMainnet
npx hardhat run scripts/deploy-variables.ts --network hardhatMainnet
npx hardhat run scripts/deploy-tipos-de-datos.ts --network hardhatMainnet
npx hardhat run scripts/deploy-payable.ts --network hardhatMainnet
```

Tambien puedes usar:

```bash
npm run deploy:hello
npm run deploy:variables
npm run deploy:tipos
npm run deploy:payable
```

## Flujo rapido de prueba

Si quieres comprobar que todo el modulo funciona:

```bash
npm install
npm run compile
npm test
npm run deploy:all
```

Si esos comandos pasan, el modulo esta funcionando correctamente en local.

## Orden sugerido

1. Lee `docs/00-que-es-solidity.md`.
2. Revisa `contracts/01-HelloWorld.sol`.
3. Ejecuta el test `test/01-HelloWorld.ts`.
4. Avanza archivo por archivo hasta `16-ReceiveFallback.sol`.
5. Usa `scripts/deploy-all.ts` cuando quieras probar todos los contratos juntos.

## Nota de seguridad

Nunca subas claves privadas, seed phrases ni archivos `.env` con credenciales. Para Sepolia usa una wallet de pruebas y ETH de testnet.

## Cuando necesitas wallet

No necesitas wallet para:

- Compilar.
- Ejecutar tests.
- Desplegar en `hardhatMainnet`.

Si necesitas wallet para:

- Conectar MetaMask a una red local persistente.
- Desplegar en Sepolia.
- Interactuar con contratos desde Etherscan o una dapp.

## Wallets, Sepolia y Etherscan

Cuando termines de probar en local, puedes pasar al flujo con wallet y testnet. Para eso sigue estas lecciones en orden:

1. [Wallets y MetaMask](docs/07-wallets-y-metamask.md)
2. [Red local vs testnet](docs/08-red-local-vs-testnet.md)
3. [Desplegar en Sepolia](docs/09-desplegar-en-sepolia.md)
4. [Ver contrato en Etherscan](docs/10-ver-contrato-en-etherscan.md)
5. [Verificar contrato en Etherscan](docs/11-verificar-contrato-en-etherscan.md)

Para Sepolia necesitas:

- Una wallet de pruebas, por ejemplo MetaMask.
- ETH de prueba de Sepolia.
- Un RPC URL de Sepolia.
- Una private key de una cuenta de pruebas.

Para no configurar variables a mano, copia el archivo de ejemplo:

```bash
cp .env.example .env
```

En PowerShell tambien puedes usar:

```powershell
Copy-Item .env.example .env
```

Luego abre `.env` y reemplaza:

```text
SEPOLIA_RPC_URL=https://tu-rpc-de-sepolia
SEPOLIA_PRIVATE_KEY=0xTU_PRIVATE_KEY_DE_PRUEBAS
```

Luego puedes desplegar un contrato en Sepolia:

```bash
npx hardhat run scripts/deploy-hello-world.ts --network sepolia
```

Usa una wallet separada para pruebas. No uses tu wallet principal ni pegues claves privadas en archivos del repositorio.
