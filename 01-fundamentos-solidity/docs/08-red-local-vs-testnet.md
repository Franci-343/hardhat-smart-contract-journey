# 08 - Red local vs testnet

Una red local y una testnet sirven para practicar, pero no son lo mismo.

Entender la diferencia evita mucha confusion cuando empiezas a desplegar contratos.

## Red local

Una red local corre en tu computadora.

Ventajas:

- Rapida.
- Gratis.
- Reiniciable.
- Ideal para tests.
- No requiere faucets.
- No depende de internet.

Desventajas:

- Nadie mas la ve.
- El estado desaparece al reiniciar.
- No representa todas las condiciones de una red publica.

Uso tipico:

```bash
npx hardhat test
npx hardhat node
```

## Testnet

Una testnet es una red publica de pruebas. Sepolia es una de las mas usadas en Ethereum.

Ventajas:

- Es publica.
- Puedes ver transacciones en Etherscan.
- Puedes probar con wallets reales.
- Se parece mas a mainnet.
- Permite compartir direcciones de contratos con otras personas.

Desventajas:

- Requiere ETH de prueba.
- Depende de RPC externos.
- Las transacciones tardan mas.
- Puede haber limites de faucets.

## Comparacion

| Tema | Red local | Testnet |
| --- | --- | --- |
| Costo | Gratis | Gas con ETH de prueba |
| Velocidad | Muy alta | Variable |
| Estado | Temporal | Persistente |
| Visibilidad | Solo tu maquina | Publica |
| Explorador | No normalmente | Etherscan |
| Uso principal | Desarrollo y tests | Ensayo antes de produccion |

## Que es un RPC

RPC significa Remote Procedure Call. En Ethereum, un RPC es el endpoint que permite hablar con un nodo.

Ejemplo conceptual:

```text
https://sepolia.infura.io/v3/...
```

Hardhat usa ese RPC para enviar transacciones y leer informacion de la red.

## Que es Chain ID

Cada red tiene un identificador.

Ejemplos comunes:

- Ethereum mainnet: `1`
- Sepolia: `11155111`
- Hardhat local: `31337`

El Chain ID ayuda a evitar que firmes una transaccion para la red equivocada.

## Cuando usar cada una

Usa red local cuando:

- Estas escribiendo el contrato.
- Estas creando tests.
- Estas depurando errores.
- Quieres velocidad.

Usa testnet cuando:

- Tus tests locales ya pasan.
- Quieres probar MetaMask.
- Quieres ver el contrato en Etherscan.
- Quieres compartir una demo publica.

## Camino recomendado

1. Contrato compila en local.
2. Tests pasan en local.
3. Despliegue local funciona.
4. Despliegue en Sepolia.
5. Revision en Etherscan.
6. Verificacion del contrato.

No saltes directo a testnet. Si algo falla en Sepolia, depurarlo suele ser mas lento.
