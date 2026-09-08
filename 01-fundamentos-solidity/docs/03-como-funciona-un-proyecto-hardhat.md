# 03 - Como funciona un proyecto Hardhat

Un proyecto Hardhat organiza todo lo necesario para desarrollar contratos inteligentes.

Este modulo no es solo una coleccion de contratos. Es un laboratorio: codigo, pruebas, scripts, configuracion y documentacion trabajando juntos.

## Estructura del proyecto

```text
01-fundamentos-solidity/
  contracts/
  docs/
  ignition/modules/
  scripts/
  test/
  hardhat.config.ts
  package.json
  tsconfig.json
```

## `contracts/`

Aqui van los archivos `.sol`.

Ejemplos esperados:

```text
contracts/01-HelloWorld.sol
contracts/02-Variables.sol
contracts/03-TiposDeDatos.sol
```

Cada contrato deberia enfocarse en un concepto. Eso hace que el aprendizaje sea progresivo y facil de testear.

## `test/`

Aqui van las pruebas automaticas.

Los tests sirven para comprobar que un contrato hace lo que esperamos. En Web3 son especialmente importantes porque un contrato desplegado no se arregla tan facil como una aplicacion tradicional.

Ejemplo de flujo:

```bash
npx hardhat test
```

Un buen test normalmente:

- Despliega el contrato.
- Llama una funcion.
- Verifica el resultado.
- Comprueba errores esperados.

## `scripts/`

Los scripts permiten ejecutar acciones puntuales, por ejemplo desplegar un contrato.

Ejemplo:

```bash
npx hardhat run scripts/deploy-hello-world.ts --network hardhatMainnet
```

Un script suele usarse cuando quieres controlar paso a paso lo que ocurre.

## `ignition/modules/`

Hardhat Ignition permite definir despliegues de forma declarativa.

En vez de escribir un script manual con muchos pasos, describes que contrato quieres desplegar y con que parametros. Hardhat se encarga de ordenar y ejecutar el despliegue.

Este enfoque ayuda cuando los despliegues se vuelven mas complejos.

## `hardhat.config.ts`

Es el archivo de configuracion principal.

En este proyecto define:

- Plugins de Hardhat.
- Version de Solidity.
- Perfil de compilacion por defecto.
- Perfil de produccion con optimizer.
- Redes locales simuladas.
- Red Sepolia.

Fragmento importante:

```ts
solidity: {
  profiles: {
    default: {
      version: "0.8.34",
    },
    production: {
      version: "0.8.34",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
}
```

## `package.json`

Define las dependencias del proyecto. Algunas importantes:

- `hardhat`: entorno principal.
- `ethers`: interaccion con Ethereum.
- `mocha`: tests.
- `chai`: assertions.
- `typescript`: scripts y tests en TypeScript.

## Que pasa al compilar

Cuando ejecutas:

```bash
npx hardhat compile
```

Hardhat:

1. Lee `hardhat.config.ts`.
2. Busca contratos en `contracts/`.
3. Usa el compilador configurado.
4. Genera artefactos con ABI y bytecode.

Esos artefactos son usados por tests, scripts y despliegues.

## Que pasa al testear

Cuando ejecutas:

```bash
npx hardhat test
```

Hardhat:

1. Levanta una red local temporal.
2. Compila si hace falta.
3. Ejecuta los archivos de `test/`.
4. Muestra resultados.

Cada test deberia ser independiente. Si un test necesita un contrato, lo despliega de nuevo.

## Que pasa al desplegar

Desplegar significa publicar bytecode en una red.

Puede ser:

- Red local simulada.
- Nodo local persistente.
- Testnet como Sepolia.
- Mainnet, cuando ya sepas lo que haces.

En este modulo usaremos primero redes locales y luego Sepolia.
