# 17 - Wallet, Sepolia y flujo real

Hasta ahora todo corrio en una red **simulada** dentro de tu computadora. En esta leccion sales a una red publica de pruebas (Sepolia) con una wallet real: es la practica mas parecida a un despliegue de verdad, sin arriesgar dinero.

Esta leccion amplia lo visto en el modulo 01: [Wallets y MetaMask](../../01-fundamentos-solidity/docs/07-wallets-y-metamask.md), [Red local vs testnet](../../01-fundamentos-solidity/docs/08-red-local-vs-testnet.md) y [Desplegar en Sepolia](../../01-fundamentos-solidity/docs/09-desplegar-en-sepolia.md). Aqui lo aplicas con los contratos intermedios.

## Panorama del flujo

```text
1. Wallet de pruebas (MetaMask)
2. ETH de Sepolia (faucet)
3. RPC de Sepolia (proveedor)
4. Configurar secretos (.env o keystore)
5. Compilar y probar en local
6. Desplegar en Sepolia
7. Ver el contrato en Etherscan
8. Verificar el contrato          -> leccion 18
9. Interactuar (MetaMask / Etherscan)
```

## Paso 1: una wallet solo para pruebas

**Crea una cuenta nueva exclusiva para desarrollo.** Nunca uses tu wallet principal.

Formas de hacerlo:

- En MetaMask: menu de cuentas > **Agregar cuenta** > cuenta nueva. Mejor todavia: crea un perfil de navegador separado con su propia instalacion de MetaMask y una seed phrase distinta.
- Una wallet generada solo para desarrollo, sin fondos reales.

Regla de oro:

```text
Si una cuenta tiene alguna vez fondos reales, no es de pruebas.
```

## Paso 2: seleccionar Sepolia

MetaMask no muestra las redes de prueba por defecto:

1. Abre el selector de redes.
2. Activa **Mostrar redes de prueba** (o *Show test networks*).
3. Elige **Sepolia**.

Datos de la red:

| Campo | Valor |
| --- | --- |
| Chain ID | `11155111` |
| Simbolo | `ETH` (de prueba) |
| Explorador | `https://sepolia.etherscan.io` |

Antes de firmar cualquier cosa, **confirma en MetaMask que dice Sepolia**. Es el error mas frecuente.

## Paso 3: conseguir ETH de prueba

Necesitas ETH de Sepolia para pagar gas. Se obtiene gratis en un **faucet**:

1. Copia la direccion publica de tu cuenta de pruebas (`0x...`).
2. Busca un "Sepolia faucet" (por ejemplo, los de Alchemy, Google Cloud Web3 o los faucets por prueba de trabajo).
3. Pega tu direccion y solicita fondos.

Los faucets tienen limites (una vez al dia, cuenta requerida, etc.). Los que piden pagar por ETH de testnet o pedir tu seed phrase son **estafas**: el ETH de prueba no cuesta dinero.

Con unos `0.1` a `0.5` ETH de Sepolia tienes de sobra para todo el modulo.

## Paso 4: un RPC de Sepolia

Hardhat necesita un nodo al que enviar las transacciones. Hay dos opciones:

- Un proveedor con cuenta gratuita (Alchemy, Infura, QuickNode...): te dan una URL tipo `https://eth-sepolia.g.alchemy.com/v2/TU_CLAVE`.
- Un RPC publico: sin registro, pero mas lento y con mas limites.

La URL de un proveedor incluye tu clave de API: **tratala como un secreto**.

## Paso 5: configurar los secretos

`hardhat.config.ts` lee dos variables para la red `sepolia`:

```ts
sepolia: {
  type: "http",
  chainType: "l1",
  url: configVariable("SEPOLIA_RPC_URL"),
  accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
},
```

### Opcion A: archivo `.env`

Copia la plantilla y rellena tus datos:

```powershell
Copy-Item .env.example .env
```

```text
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_CLAVE
SEPOLIA_PRIVATE_KEY=0xTU_PRIVATE_KEY_DE_PRUEBAS
```

El proyecto carga `.env` automaticamente (funcion `loadDotEnv` en `hardhat.config.ts`). El `.gitignore` ya excluye `.env`, pero **verificalo tu mismo** antes de cada commit:

```bash
git status
```

Si `.env` aparece en la lista, detente.

Para obtener la clave privada en MetaMask: menu de la cuenta > **Detalles de la cuenta** > **Mostrar clave privada**. Es la clave de la cuenta de **pruebas**, no la seed phrase.

### Opcion B: keystore de Hardhat (mas segura)

Hardhat puede guardar los secretos cifrados con una contrasena, sin dejar texto plano en el disco:

```bash
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

Como `configVariable(...)` busca primero en las variables de entorno y luego en el keystore, no hace falta cambiar el config. Ojo con esa prioridad: si ademas tienes un `.env` con el mismo nombre, **gana el `.env`**. Si eliges el keystore, borra esas lineas del `.env`. En integracion continua (CI) el keystore no se usa. Revisa `npx hardhat keystore --help` para ver los comandos.

Cualquiera que sea la opcion:

- No pegues la clave privada en un archivo `.ts` ni en un `.md`.
- No la envies por chat, correo ni capturas de pantalla.
- Si sospechas que se filtro, **descarta esa cuenta** y crea otra: en testnet no pierdes nada.

## Paso 6: probar en local primero

Nunca despliegues sin haber pasado por local:

```bash
npm run compile
npm test
npx hardhat run scripts/deploy-ERC20Basico.ts --network hardhatMainnet
```

Un despliegue en Sepolia cuesta gas (ETH de prueba, pero tiempo y limites de faucet reales) y sus errores quedan escritos en una blockchain publica.

## Paso 7: desplegar en Sepolia

### Con un script

```bash
npx hardhat run scripts/deploy-ERC20Basico.ts --network sepolia
```

La misma linea sirve para cualquier script; solo cambia `--network hardhatMainnet` por `--network sepolia`. El script imprime la direccion del contrato: **guardala**.

Diferencias con la red local:

- Cada transaccion tarda unos segundos (un bloque de Ethereum cada ~12 s), no es instantanea.
- Cada operacion gasta gas (de prueba) de la cuenta que firma.
- Las transacciones no se pueden deshacer.

Por eso los scripts de este modulo esperan la confirmacion con `waitForTransactionReceipt` antes de leer el resultado de una escritura:

```ts
const hash = await contrato.write.agregarUsuario(["Ana", 10n]);
await publicClient.waitForTransactionReceipt({ hash });
```

### Con Hardhat Ignition

```bash
npx hardhat ignition deploy ignition/modules/14-ERC20Basico.ts --network sepolia
```

Ignition tiene ventajas en redes reales:

- Guarda un **diario del despliegue** en `ignition/deployments/chain-11155111/`. Si se corta a la mitad, lo vuelves a ejecutar y **continua donde quedo** en lugar de duplicar contratos.
- Resuelve el orden entre contratos que dependen unos de otros.
- Permite parametros por archivo (`--parameters params.json`) y verificacion (`--verify`, leccion 18).

Para redesplegar desde cero: `--reset`.

Los archivos del diario contienen direcciones y hashes, no secretos. Muchos proyectos los suben a Git para documentar donde esta cada contrato.

### Un token propio en tu wallet

Despues de desplegar `ERC20Basico`:

1. En MetaMask (red Sepolia): **Importar tokens**.
2. Pega la direccion del contrato.
3. Veras el simbolo `TCU` y tu saldo de `1000000`.

Ahora puedes enviar tokens a otra cuenta de prueba desde MetaMask, como con cualquier token real.

## Paso 8: comprobar en Etherscan

Abre:

```text
https://sepolia.etherscan.io/address/TU_DIRECCION
```

Confirma que:

- La URL dice **sepolia**.etherscan.io (no `etherscan.io`).
- El campo **Contract Creator** es tu cuenta de pruebas.
- Hay una transaccion de creacion.

Lo demas (leer el codigo, interactuar) esta en la leccion 18.

## Local, testnet y mainnet

| | Local (`hardhatMainnet`) | Sepolia | Mainnet |
| --- | --- | --- | --- |
| Dinero | Falso, infinito | ETH de prueba gratis | ETH real |
| Velocidad | Instantanea | ~12 s por bloque | ~12 s por bloque |
| Persistencia | Se borra al terminar | Publica y permanente | Publica y permanente |
| Otros usuarios | No | Si | Si |
| Errores | Gratis | Publicos | Cuestan dinero |

Recomendacion: **local -> Sepolia -> (solo despues de una auditoria) mainnet**. Este curso no despliega en mainnet.

## Problemas frecuentes

### `insufficient funds`

La cuenta no tiene ETH de Sepolia. Revisa el saldo y pide fondos al faucet.

### Hardhat dice que falta una variable de configuracion

`SEPOLIA_RPC_URL` o `SEPOLIA_PRIVATE_KEY` no estan definidas. Revisa que `.env` este en la carpeta `02-solidity-intermedio` y que los nombres sean exactos.

### La transaccion queda pendiente

Sepolia puede estar congestionada o el gas fue demasiado bajo. Espera unos minutos; si el script se corto, con Ignition puedes volver a ejecutarlo.

### Error de red o limite de peticiones (rate limit)

El RPC gratuito se satura. Usa un proveedor con cuenta o espera.

### Desplegaste en la red equivocada

Revisa el `--network`. Con `hardhatMainnet` la direccion no existe en Sepolia y Etherscan no la encuentra.

### Etherscan no muestra mi contrato

Espera un minuto y actualiza. Comprueba que copiaste la direccion completa y que estas en el explorador de Sepolia.

## Checklist antes de desplegar en Sepolia

- `npm test` pasa en local.
- La cuenta es **solo de pruebas** y tiene ETH de Sepolia.
- `.env` (o keystore) configurado y **no aparece en `git status`**.
- El RPC es de Sepolia.
- `--network sepolia` en el comando.
- Guardaste la direccion del contrato y el commit exacto del codigo.

## Ejercicios

1. Despliega `ERC20Basico` en Sepolia y envia `10 TCU` a una segunda cuenta de prueba desde MetaMask.
2. Despliega `ConstantImmutable` con Ignition pasando un `feeBps` distinto en un archivo `params.json`.
3. Ejecuta `deploy-OraculosInterfacesExternas.ts` en Sepolia y compara el precio de ETH que devuelve con el de una pagina de precios.

## Resumen

- Usa una wallet exclusiva para pruebas y confirma siempre la red antes de firmar.
- Necesitas ETH de Sepolia (faucet), un RPC y una clave privada de la cuenta de pruebas.
- Los secretos van en `.env` (ignorado por Git) o en el keystore de Hardhat, nunca en el codigo.
- Ignition guarda el estado del despliegue y permite reanudarlo.
- Recorrido seguro: local, Sepolia y solo despues, mainnet con auditoria.
