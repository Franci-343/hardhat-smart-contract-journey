# 18 - Etherscan y verificacion

Etherscan es el **explorador de bloques** de Ethereum: una pagina web para ver cualquier cuenta, transaccion o contrato. Sepolia tiene su propia version: `https://sepolia.etherscan.io`.

Esta leccion amplia el modulo 01: [Ver contrato en Etherscan](../../01-fundamentos-solidity/docs/10-ver-contrato-en-etherscan.md) y [Verificar contrato en Etherscan](../../01-fundamentos-solidity/docs/11-verificar-contrato-en-etherscan.md).

## Que ves en un contrato sin verificar

Cuando abres la direccion de un contrato recien desplegado:

| Pestana | Que muestra |
| --- | --- |
| **Transactions** | Llamadas al contrato |
| **Internal Txns** | ETH movido por el contrato hacia otras direcciones |
| **Token Transfers** | Movimientos de ERC-20 / ERC-721 |
| **Contract** | El bytecode (ilegible) |
| **Events** | Eventos emitidos, sin decodificar |

Un contrato sin verificar solo muestra **bytecode**: una lista de bytes que nadie puede leer. Como usuario, no tienes forma de saber que hace.

## Que hace la verificacion

Verificar es publicar el **codigo fuente** y demostrar que al compilarlo produce exactamente el bytecode desplegado en esa direccion.

Consecuencias al verificar:

- Cualquiera puede **leer el codigo** en la pestana **Contract**.
- Aparecen **Read Contract** y **Write Contract**: interfaces para llamar funciones desde el navegador.
- Los **eventos** y las entradas de las transacciones se decodifican con nombres y valores.
- Aparece el ABI listo para copiar.

Verificar **no** significa "auditado" ni "seguro": solo significa que el codigo publicado coincide con lo desplegado. Es lo minimo para inspirar confianza; un contrato sin verificar no deberia recibir dinero.

## Paso 1: obtener una API key

1. Crea una cuenta gratuita en [etherscan.io](https://etherscan.io).
2. Ve a **API Keys** y crea una clave.
3. Guardala en tu `.env` (no la subas a Git):

```text
ETHERSCAN_API_KEY=TU_API_KEY_DE_ETHERSCAN
```

El proyecto ya declara esta variable en `hardhat.config.ts`:

```ts
verify: {
  etherscan: {
    apiKey: configVariable("ETHERSCAN_API_KEY"),
  },
},
```

Una unica clave de Etherscan sirve para todas las redes que Etherscan soporta, incluida Sepolia. Como la API key no puede mover fondos, es menos delicada que una clave privada, pero tampoco la publiques.

## Paso 2: verificar

Necesitas tener el contrato ya desplegado en Sepolia (leccion 17) y su direccion.

### Contrato sin argumentos de constructor

```bash
npx hardhat verify --network sepolia DIRECCION_DEL_CONTRATO
```

Ejemplo con `BovedaSegura`, que no recibe argumentos:

```bash
npx hardhat verify --network sepolia 0xTuDireccionDeBovedaSegura
```

### Contrato con argumentos de constructor

Debes pasar **exactamente los mismos** argumentos que usaste al desplegar, en el mismo orden. Para `ERC20Basico("Token Curso", "TCU", 1000000)`:

```bash
npx hardhat verify --network sepolia 0xTuDireccion "Token Curso" TCU 1000000
```

Si prefieres no escribirlos en la terminal, puedes usar un archivo:

```bash
npx hardhat verify --network sepolia --constructor-args-path args/erc20.ts 0xTuDireccion
```

donde `args/erc20.ts` exporta un array con los argumentos. Si tienes dudas, `npx hardhat verify --help` muestra las opciones vigentes.

### Verificar directamente al desplegar con Ignition

```bash
npx hardhat ignition deploy ignition/modules/14-ERC20Basico.ts --network sepolia --verify
```

Ignition despliega y verifica todos los contratos del modulo, con los argumentos correctos: es lo mas comodo porque **ya conoce** los argumentos.

O verificar un despliegue que ya existe:

```bash
npx hardhat ignition verify chain-11155111
```

`chain-11155111` es el ID de despliegue por defecto de Sepolia. Puedes ver los tuyos con `npx hardhat ignition deployments`.

Como `verify` usa **todos los verificadores habilitados**, tambien puede publicar en Sourcify, que no necesita API key.

## Que debe coincidir

La verificacion compara bytecode. Para que coincida necesitas:

| Elemento | Debe ser igual a |
| --- | --- |
| Codigo fuente | El que compilaste al desplegar |
| Version del compilador | `0.8.34` (`hardhat.config.ts`) |
| Optimizer y `runs` | La misma configuracion del despliegue |
| Argumentos del constructor | Los del despliegue, en el mismo orden |
| Librerias enlazadas | Las mismas direcciones |

Por eso el flujo recomendado es:

1. Compilar y probar.
2. Desplegar.
3. **Guardar el commit** y la direccion.
4. Verificar **sin tocar el codigo**.

Si cambias una sola letra del contrato despues de desplegar (incluso un comentario puede cambiar los metadatos), la verificacion puede fallar. Si eso pasa, vuelve al commit exacto del despliegue.

### Perfil de compilacion

En `hardhat.config.ts` hay dos perfiles: `default` (sin optimizer) y `production` (con optimizer, 200 runs). Si desplegaste con uno, verifica con el mismo:

```bash
npx hardhat --build-profile production ignition deploy ignition/modules/14-ERC20Basico.ts --network sepolia
```

El perfil debe ser el mismo al desplegar y al verificar, porque cambia el bytecode.

## Paso 3: usar el contrato desde Etherscan

Con el contrato verificado, abre la pestana **Contract**:

### Read Contract

Llama funciones `view` sin gas ni wallet. En `ERC20Basico`:

- `name`, `symbol`, `decimals`, `totalSupply`.
- `balanceOf(direccion)`: el saldo de cualquier cuenta.

Recuerda que los saldos aparecen en la unidad minima: `1000000000000000000000000` son `1 000 000` tokens con 18 decimales.

### Write Contract

Envia transacciones desde tu wallet:

1. Pulsa **Connect to Web3** y elige MetaMask (en Sepolia).
2. Elige una funcion, por ejemplo `transfer`.
3. Rellena `to` y `value`.
4. Pulsa **Write**. MetaMask abre la confirmacion con el costo de gas.

**Lee siempre** la ventana de MetaMask antes de confirmar: verifica la red, la direccion del contrato y la funcion.

### Events

Muestra los eventos decodificados: `Transfer(from, to, value)`, `Approval(...)`. Es la forma mas rapida de ver el historial de un token.

### Decodificar una transaccion

En cualquier transaccion, **Click to show more** > **Decode Input Data** muestra que funcion se llamo y con que argumentos. Sirve para investigar que hizo una transaccion cualquiera.

## Verificar es una buena practica de seguridad

Si un dia interactuas con un contrato ajeno:

- Comprueba que este **verificado**.
- Lee las funciones que puedan mover tus fondos.
- Busca funciones de administrador (`mint`, `pause`, `withdraw`, `transferOwnership`) y mira **quien es el owner**.
- Revisa los eventos anteriores: un contrato con historial de `OwnershipTransferred` inusuales merece cuidado.

Es exactamente lo que estudiaste en las lecciones 12 a 14, ahora visto desde fuera.

## Errores comunes

### `Compiler version mismatch`

La version de `solc` usada al desplegar no coincide con la de la verificacion. Revisa `hardhat.config.ts`.

### `Bytecode does not match`

Cambio el codigo, el optimizer, los argumentos o las librerias. Verifica desde el commit exacto del despliegue.

### `Invalid API key`

La clave esta mal copiada o `ETHERSCAN_API_KEY` no esta definida. Prueba abrir tu clave en Etherscan y compararla.

### `Contract already verified`

No es un error: ya esta verificado. Con `--force` puedes forzarlo de nuevo.

### `Address is not a smart contract`

La direccion no tiene codigo en esa red. Comprueba que usas `--network sepolia` y que la transaccion de despliegue termino.

### Verificar demasiado rapido

A veces Etherscan tarda uno o dos minutos en indexar un contrato nuevo. Espera y reintenta.

## Ejercicios

1. Despliega `BovedaSegura` en Sepolia, verificalo y usa **Write Contract** para llamar a `depositar` con `0.001 ETH` (campo `payableAmount`).
2. Despliega `ERC20Basico` con Ignition y la opcion `--verify`. Compara con verificarlo a mano.
3. Abre en Etherscan un token conocido (por ejemplo, el contrato de USDC en mainnet) y localiza: su codigo, su owner o admin y las funciones que un administrador puede ejecutar.
4. En tu contrato verificado, usa **Decode Input Data** en una de tus transacciones.

## Resumen

- Un contrato sin verificar solo muestra bytecode; verificarlo publica el codigo fuente.
- Necesitas una `ETHERSCAN_API_KEY`, el mismo compilador, optimizer y argumentos del constructor.
- `npx hardhat verify` verifica uno a uno; `ignition deploy --verify` lo hace por ti.
- Verificado habilita **Read/Write Contract** y decodifica eventos.
- Verificar da transparencia, no seguridad: sigue revisando lo que el contrato permite hacer.
