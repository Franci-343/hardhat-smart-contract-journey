# 00 - Introduccion a Solidity intermedio

En el modulo 01 aprendiste las piezas sueltas: variables, funciones, mappings, eventos, errores y pagos. En este modulo aprendes a **combinarlas** para escribir contratos que se parecen a los de proyectos reales.

## Que vas a aprender

| Bloque | Lecciones | Idea central |
| --- | --- | --- |
| Reutilizar codigo | 01 a 05 | Herencia, constructores, abstractos, interfaces y librerias |
| Escribir mejor | 06 a 08 | Modifiers avanzados, `constant`/`immutable`, `storage`/`memory`/`calldata` |
| Hablar con otros contratos | 09 a 11 | Llamadas entre contratos, `call` de bajo nivel, `try/catch` |
| Proteger contratos | 12 y 13 | Roles, `Ownable` y pausas de emergencia |
| Estandares | 14 a 16 | ERC-20, ERC-721 y oraculos de precios |
| Flujo real | 17 y 18 | Wallet de pruebas, Sepolia, Etherscan y verificacion |
| Seguridad | 19 | Checklist antes de desplegar |

## Requisitos previos

Deberias poder hacer esto sin ayuda:

- Compilar y ejecutar tests en `01-fundamentos-solidity`.
- Explicar `msg.sender`, `msg.value`, `payable`, eventos y errores personalizados.
- Desplegar un contrato en la red local `hardhatMainnet`.
- Explicar la diferencia entre una direccion y una clave privada.

Si algo de esto no esta claro, repasa primero el modulo 01 y `00-fundamentos-blockchain`.

## Diferencia con el modulo 01: viem en lugar de ethers

El modulo 01 usa **ethers + Mocha + Chai**. Este modulo usa **viem + `node:test`**, el runner de tests que viene con Node.js.

La idea es la misma, cambia la forma de escribirla:

```ts
// Modulo 01 (ethers + chai)
const contrato = await ethers.deployContract("Perro");
expect(await contrato.especie()).to.equal("Perro");

// Modulo 02 (viem + node:test)
const contrato = await viem.deployContract("Perro");
assert.equal(await contrato.read.especie(), "Perro");
```

Diferencias que veras en cada test:

- Las lecturas se hacen con `contrato.read.funcion()` y las escrituras con `contrato.write.funcion()`.
- Los numeros grandes son `bigint` (`10n`), no `number`.
- Las aserciones de Ethereum estan en `viem.assertions` (`revertWithCustomError`, `emitWithArgs`, ...).
- El tiempo de la red se manipula con `networkHelpers.time.increase(...)`.

Todo el proyecto esta escrito con tipos: si te equivocas de nombre de funcion o de argumento, TypeScript te lo avisa antes de ejecutar.

## Estructura del modulo

```text
02-solidity-intermedio/
  contracts/          16 contratos, uno por leccion
  test/               Un test por contrato (mismo numero)
  ignition/modules/   Modulos de despliegue con Hardhat Ignition
  scripts/            Scripts de despliegue con viem
  docs/               Estas lecciones
```

Cada leccion `NN` de `docs/` explica el contrato `NN-*.sol`, y su test `NN-*.ts` es la prueba ejecutable de lo que dice la leccion.

## Forma de estudiar cada leccion

1. Lee la leccion en `docs/`.
2. Abre el contrato en `contracts/` y lee los comentarios.
3. Ejecuta su test:

   ```bash
   npx hardhat test test/01-Herencia.ts
   ```

4. Cambia algo en el contrato para romperlo a proposito y vuelve a ejecutar el test. Leer el fallo ensena mas que ver todo en verde.
5. Haz los ejercicios del final de la leccion.

## Comandos utiles

```bash
npm install            # instalar dependencias
npm run compile        # compilar
npm test               # ejecutar todos los tests
npx hardhat test test/06-ModifiersAvanzados.ts   # un solo test
```

Desplegar un contrato con un script en la red local simulada:

```bash
npx hardhat run scripts/deploy-Herencia.ts --network hardhatMainnet
```

Desplegar con Ignition:

```bash
npx hardhat ignition deploy ignition/modules/01-Herencia.ts --network hardhatMainnet
```

## Por que los contratos no usan OpenZeppelin

En proyectos reales casi nunca escribes `Ownable`, `AccessControl`, ERC-20 o ERC-721 a mano: usas [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts), que esta auditado y probado por miles de proyectos.

En este modulo los escribimos a mano, en version simplificada, **para que entiendas que hay dentro**. Cuando entiendes una version pequena, leer la de OpenZeppelin deja de ser intimidante. Cada leccion indica cual es el equivalente real.

## Sobre versiones

Todos los contratos usan `pragma solidity ^0.8.34;` y el compilador esta fijado en `0.8.34` en `hardhat.config.ts`. Desde Solidity 0.8 la aritmetica revierte por overflow/underflow automaticamente, asi que no hace falta SafeMath.

## Seguridad desde el dia uno

- Nunca subas `.env`, claves privadas ni seed phrases.
- Usa una wallet exclusiva para pruebas.
- Los contratos de este modulo son **didacticos**: no los uses con dinero real sin una auditoria.

## Siguiente paso

Empieza con [01 - Herencia](01-herencia.md).
