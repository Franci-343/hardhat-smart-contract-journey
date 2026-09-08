# 07 - Wallets y MetaMask

Una wallet es una herramienta para administrar cuentas blockchain.

MetaMask es una de las wallets mas usadas en Ethereum y redes compatibles. Permite firmar transacciones, cambiar de red, ver saldos e interactuar con aplicaciones Web3.

## Que guarda una wallet

Una wallet no guarda tus fondos dentro de la extension. Tus fondos viven en la blockchain.

La wallet guarda o administra:

- Claves privadas.
- Cuentas.
- Redes.
- Firmas.
- Permisos de conexion con sitios.

La clave privada es lo que demuestra que una direccion te pertenece.

## Direccion vs clave privada

La direccion es publica:

```text
0x1234...
```

Puedes compartirla para recibir fondos o identificar tu cuenta.

La clave privada es secreta. Quien tenga tu clave privada puede mover tus fondos.

Regla absoluta:

```text
Nunca compartas tu private key ni tu seed phrase.
```

## Que es una seed phrase

La seed phrase es una frase de recuperacion que permite reconstruir tus cuentas.

Si alguien la ve, puede controlar tu wallet. Guardala fuera del codigo, fuera de capturas de pantalla y fuera de repositorios.

## MetaMask en desarrollo local

Para practicar con Hardhat local:

1. Abre MetaMask.
2. Agrega una red manual.
3. Usa el RPC local.
4. Importa una cuenta de prueba.

Datos comunes:

```text
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Symbol: ETH
```

Estas cuentas solo sirven para desarrollo.

## MetaMask en Sepolia

Sepolia es una testnet. Usa ETH de prueba, sin valor real.

Para trabajar con Sepolia necesitas:

- Agregar o seleccionar la red Sepolia.
- Tener ETH de prueba.
- Usar una cuenta controlada por ti.
- Conectar esa cuenta al proyecto mediante private key o wallet.

## Faucets

Un faucet entrega ETH de prueba para testnets.

Normalmente te pedira:

- Tu direccion publica.
- Esperar un limite de tiempo.
- A veces iniciar sesion o demostrar actividad.

No necesitas ETH real para practicar en Sepolia.

## Firmar no es lo mismo que enviar

MetaMask puede pedir firmas de dos tipos:

- Firmar un mensaje: no mueve fondos por si solo.
- Firmar una transaccion: puede cambiar estado y gastar gas.

Lee siempre que estas aprobando.

## Permisos de sitios

Cuando conectas MetaMask a una dapp, das permiso para que el sitio vea tus direcciones. Eso no significa que pueda gastar tus fondos automaticamente, pero si puede proponerte transacciones para firmar.

Puedes revisar y revocar conexiones desde MetaMask.

## Buenas practicas

- Usa una wallet separada para desarrollo.
- No uses tu wallet principal para pruebas.
- No subas claves privadas al repo.
- No pegues tu seed phrase en scripts.
- Verifica siempre la red antes de firmar.
- En testnet, confirma que estas usando ETH de prueba.

## Relacion con Hardhat

Hardhat puede desplegar contratos usando una cuenta privada configurada para una red.

MetaMask te ayuda a:

- Ver esa cuenta.
- Enviar transacciones manuales.
- Revisar saldos.
- Interactuar con contratos desde exploradores o frontends.
