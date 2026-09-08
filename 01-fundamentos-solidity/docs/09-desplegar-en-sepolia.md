# 09 - Desplegar en Sepolia

Sepolia es una red publica de pruebas para Ethereum. Permite desplegar contratos sin gastar ETH real.

Antes de desplegar en Sepolia, asegurate de que el contrato compile y los tests pasen en local.

## Requisitos

Necesitas:

- Node.js y npm.
- Dependencias instaladas con `npm install`.
- Una wallet de desarrollo.
- ETH de prueba en Sepolia.
- Un RPC URL de Sepolia.
- Una private key de una cuenta de pruebas.

## Paso 1: compilar

```bash
npx hardhat compile
```

Si falla, arregla primero la compilacion. No tiene sentido desplegar un contrato que no compila.

## Paso 2: probar

```bash
npx hardhat test
```

Los tests no garantizan que el contrato sea perfecto, pero reducen errores obvios.

## Paso 3: conseguir ETH de prueba

Abre MetaMask, selecciona Sepolia y copia tu direccion publica.

Luego usa un faucet de Sepolia para recibir ETH de prueba.

No uses una wallet con fondos reales para ejercicios.

## Paso 4: configurar variables

Este proyecto usa en `hardhat.config.ts`:

```ts
url: configVariable("SEPOLIA_RPC_URL"),
accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
```

Debes configurar:

```text
SEPOLIA_RPC_URL
SEPOLIA_PRIVATE_KEY
```

En PowerShell puedes probar temporalmente:

```powershell
$env:SEPOLIA_RPC_URL="https://tu-rpc-de-sepolia"
$env:SEPOLIA_PRIVATE_KEY="0xTU_PRIVATE_KEY"
```

Importante:

- No subas la private key a Git.
- No la pegues en Markdown publico.
- Usa una cuenta solo para pruebas.

## Paso 5: desplegar con script

Ejemplo:

```bash
npx hardhat run scripts/deploy-hello-world.ts --network sepolia
```

El script debe imprimir la direccion del contrato desplegado.

Guarda esa direccion para verla en Etherscan.

## Paso 6: confirmar en Etherscan

Abre:

```text
https://sepolia.etherscan.io/address/TU_DIRECCION
```

Si el despliegue fue exitoso, veras:

- Direccion del contrato.
- Balance.
- Transacciones.
- Bytecode.
- Cuenta que lo desplego.

## Errores frecuentes

### Falta ETH de prueba

El despliegue necesita gas. Si no tienes ETH de Sepolia, fallara.

### RPC incorrecto

Verifica que el RPC sea de Sepolia, no de mainnet u otra red.

### Private key incorrecta

La private key debe pertenecer a la cuenta que tiene ETH de prueba.

### Contrato demasiado grande o caro

En fundamentos no deberia pasar, pero contratos grandes pueden necesitar mas gas.

## Checklist antes de Sepolia

- `npx hardhat compile` funciona.
- `npx hardhat test` funciona.
- La wallet esta en Sepolia.
- La cuenta tiene ETH de prueba.
- El RPC URL es de Sepolia.
- La private key no esta en el repositorio.
- El script de despliegue apunta al contrato correcto.

Desplegar en testnet es el primer momento donde tu codigo sale de tu maquina. Hazlo con calma.
