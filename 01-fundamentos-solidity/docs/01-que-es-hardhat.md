# 01 - Que es Hardhat

Hardhat es un entorno de desarrollo para crear, compilar, probar y desplegar smart contracts.

Puedes pensar en Hardhat como una caja de herramientas para trabajar con Solidity de forma profesional. Remix sirve para empezar rapido en el navegador; Hardhat sirve para construir proyectos reales con archivos, tests, scripts, dependencias y configuracion.

## Para que sirve Hardhat

Hardhat te ayuda a:

- Compilar contratos Solidity.
- Ejecutar una blockchain local para pruebas.
- Escribir tests automaticos.
- Desplegar contratos con scripts.
- Simular transacciones.
- Depurar errores.
- Conectarte a testnets como Sepolia.
- Preparar proyectos para produccion.

## Que problema resuelve

Sin Hardhat, tendrias que hacer manualmente muchas tareas:

- Elegir y ejecutar el compilador de Solidity.
- Generar ABI y bytecode.
- Levantar una red local.
- Conectar una wallet.
- Mandar transacciones a mano.
- Repetir pruebas despues de cada cambio.

Hardhat ordena todo ese flujo.

## Hardhat en este proyecto

Este modulo tiene una estructura como esta:

```text
01-fundamentos-solidity/
  contracts/
  docs/
  ignition/modules/
  scripts/
  test/
  hardhat.config.ts
  package.json
```

Cada carpeta tiene un rol:

- `contracts/`: contratos escritos en Solidity.
- `test/`: pruebas automaticas.
- `scripts/`: scripts para desplegar o interactuar.
- `ignition/modules/`: modulos de despliegue con Hardhat Ignition.
- `docs/`: explicaciones paso a paso.
- `hardhat.config.ts`: configuracion principal.

## Hardhat 3 y EDR

Este proyecto usa Hardhat 3. En la configuracion aparecen redes locales simuladas con EDR:

```ts
hardhatMainnet: {
  type: "edr-simulated",
  chainType: "l1",
}
```

EDR es el motor de simulacion moderno de Hardhat. Permite ejecutar una red local rapida para probar contratos sin gastar Ether real.

Tambien aparece una red `sepolia`:

```ts
sepolia: {
  type: "http",
  chainType: "l1",
  url: configVariable("SEPOLIA_RPC_URL"),
  accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
}
```

Eso significa que el proyecto puede conectarse a Sepolia usando variables de configuracion, sin escribir claves privadas directamente en el codigo.

## Herramientas principales

Hardhat suele trabajar junto con:

- `ethers`: libreria para interactuar con contratos.
- `mocha`: framework de pruebas.
- `chai`: assertions para tests.
- `hardhat-ethers`: integracion entre Hardhat y ethers.
- `hardhat-ignition`: sistema de despliegue declarativo.

En este repo esas dependencias ya aparecen en `package.json`.

## Comandos que usaras mucho

Desde la carpeta `01-fundamentos-solidity`:

```bash
npx hardhat compile
npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy-hello-world.ts --network hardhatMainnet
```

Si algo falla, puedes pedir mas detalle con:

```bash
npx hardhat compile --show-stack-traces
```

## Por que aprender Hardhat desde el inicio

Porque te obliga a trabajar como se trabaja en proyectos reales:

- Escribes codigo en archivos.
- Versionas con Git.
- Pruebas antes de desplegar.
- Separas contratos, scripts y documentacion.
- Evitas depender de clicks manuales.

La meta no es aprender comandos de memoria. La meta es construir confianza para moverte en un proyecto Web3 real.
