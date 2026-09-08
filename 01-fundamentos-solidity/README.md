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

## Comandos principales

Compilar:

```bash
npx hardhat compile
```

Ejecutar tests:

```bash
npx hardhat test
```

Desplegar todos los contratos en la red local simulada:

```bash
npx hardhat run scripts/deploy-all.ts --network hardhatMainnet
```

Desplegar ejemplos puntuales:

```bash
npx hardhat run scripts/deploy-hello-world.ts --network hardhatMainnet
npx hardhat run scripts/deploy-variables.ts --network hardhatMainnet
npx hardhat run scripts/deploy-tipos-de-datos.ts --network hardhatMainnet
npx hardhat run scripts/deploy-payable.ts --network hardhatMainnet
```

## Orden sugerido

1. Lee `docs/00-que-es-solidity.md`.
2. Revisa `contracts/01-HelloWorld.sol`.
3. Ejecuta el test `test/01-HelloWorld.ts`.
4. Avanza archivo por archivo hasta `16-ReceiveFallback.sol`.
5. Usa `scripts/deploy-all.ts` cuando quieras probar todos los contratos juntos.

## Nota de seguridad

Nunca subas claves privadas, seed phrases ni archivos `.env` con credenciales. Para Sepolia usa una wallet de pruebas y ETH de testnet.
