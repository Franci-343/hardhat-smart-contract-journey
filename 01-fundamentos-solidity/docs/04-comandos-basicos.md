# 04 - Comandos basicos

Estos comandos se ejecutan desde la carpeta del modulo:

```bash
cd 01-fundamentos-solidity
```

## Instalar dependencias

Si acabas de clonar el repo:

```bash
npm install
```

Esto descarga las dependencias definidas en `package.json`.

## Compilar contratos

```bash
npx hardhat compile
```

Compilar transforma los contratos `.sol` en artefactos que Hardhat puede usar para tests y despliegues.

Si quieres ver mas detalle cuando falla:

```bash
npx hardhat compile --show-stack-traces
```

## Ejecutar tests

```bash
npx hardhat test
```

Los tests viven en `test/`. Sirven para validar el comportamiento de los contratos.

Para ejecutar un archivo especifico:

```bash
npx hardhat test test/01-HelloWorld.ts
```

## Levantar una red local

```bash
npx hardhat node
```

Esto levanta una blockchain local para desarrollo. Normalmente muestra cuentas de prueba con Ether falso.

Mientras el nodo esta corriendo, puedes abrir otra terminal para desplegar o interactuar.

## Ejecutar un script

```bash
npx hardhat run scripts/deploy-hello-world.ts --network hardhatMainnet
```

La parte `--network` indica a que red quieres enviar la transaccion.

## Usar Sepolia

Para usar Sepolia necesitas configurar:

- `SEPOLIA_RPC_URL`
- `SEPOLIA_PRIVATE_KEY`

Este proyecto usa `configVariable`, asi que las credenciales no deberian escribirse directamente dentro de `hardhat.config.ts`.

Segun tu setup de Hardhat, puedes usar variables de entorno o el sistema de variables de configuracion de Hardhat.

Ejemplo conceptual con variables de entorno:

```bash
SEPOLIA_RPC_URL="https://..."
SEPOLIA_PRIVATE_KEY="0x..."
```

En Windows PowerShell:

```powershell
$env:SEPOLIA_RPC_URL="https://..."
$env:SEPOLIA_PRIVATE_KEY="0x..."
```

## Limpiar artefactos

```bash
npx hardhat clean
```

Elimina artefactos generados para forzar una compilacion limpia.

## Comandos utiles de npm

Ver dependencias instaladas:

```bash
npm list --depth=0
```

Ver version de Node:

```bash
node --version
```

Ver version de npm:

```bash
npm --version
```

## Orden recomendado de trabajo

1. Escribe o modifica un contrato.
2. Ejecuta `npx hardhat compile`.
3. Escribe o ajusta tests.
4. Ejecuta `npx hardhat test`.
5. Si todo pasa, despliega en local.
6. Solo despues prueba en Sepolia.

## Nota importante

Si un comando falla, no lo ignores. Los errores de Hardhat suelen decir exactamente donde mirar: contrato, linea, configuracion, red o variable faltante.
