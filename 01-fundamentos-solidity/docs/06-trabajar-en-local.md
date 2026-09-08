# 06 - Trabajar en local

Antes de usar una testnet, conviene trabajar en local. Es rapido, gratis y seguro.

Una red local simula una blockchain en tu maquina. Puedes desplegar contratos, enviar transacciones y romper cosas sin gastar dinero real.

## Por que trabajar en local

Trabajar en local te permite:

- Probar contratos rapidamente.
- Ejecutar tests muchas veces.
- Usar cuentas con Ether falso.
- Depurar errores sin presion.
- Reiniciar el estado cuando quieras.

## Dos formas de trabajar en local

### 1. Red temporal para tests

Cuando ejecutas:

```bash
npx hardhat test
```

Hardhat crea una red local temporal, ejecuta los tests y la descarta.

Esto es ideal para pruebas automaticas.

### 2. Nodo local persistente

Cuando ejecutas:

```bash
npx hardhat node
```

Hardhat levanta una red local que permanece activa hasta que cierres la terminal.

Esto es util para:

- Probar scripts.
- Conectar MetaMask.
- Simular despliegues.
- Interactuar manualmente.

## Flujo recomendado

Terminal 1:

```bash
npx hardhat node
```

Terminal 2:

```bash
npx hardhat run scripts/deploy-hello-world.ts --network localhost
```

Si tu configuracion usa otra red local, usa el nombre definido en `hardhat.config.ts`.

En este proyecto aparecen redes simuladas como:

```text
hardhatMainnet
hardhatOp
```

## Cuentas locales

Hardhat normalmente muestra varias cuentas de prueba al iniciar el nodo.

Esas cuentas:

- Son publicas.
- Solo sirven en local.
- Tienen Ether falso.
- No deben usarse en mainnet ni con fondos reales.

## Reiniciar la red local

Si cierras `npx hardhat node` y lo vuelves a abrir, el estado vuelve a cero.

Eso significa:

- Los contratos desplegados desaparecen.
- Los saldos vuelven al estado inicial.
- Las direcciones pueden repetirse si usas las mismas cuentas.

## Conectar MetaMask a local

Datos tipicos:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

Luego puedes importar una cuenta de prueba usando una private key que Hardhat muestre al iniciar el nodo.

## Cuidado con las claves

Las claves locales de Hardhat son conocidas por todos. Sirven para practicar, nada mas.

Nunca mandes fondos reales a cuentas generadas para pruebas locales.

## Como saber que todo funciona

Un flujo minimo:

1. Ejecuta `npx hardhat compile`.
2. Ejecuta `npx hardhat test`.
3. Levanta `npx hardhat node`.
4. Despliega con un script.
5. Copia la direccion del contrato.
6. Interactua desde otro script, consola o wallet.

Cuando este flujo te salga natural, Sepolia sera mucho menos intimidante.
