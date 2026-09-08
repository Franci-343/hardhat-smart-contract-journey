# 10 - Ver contrato en Etherscan

Etherscan es un explorador de bloques. Permite ver informacion publica de Ethereum y sus testnets.

Para Sepolia se usa:

```text
https://sepolia.etherscan.io
```

## Que puedes ver

Con una direccion de contrato puedes revisar:

- Balance.
- Transacciones.
- Direccion creadora.
- Bloque de creacion.
- Bytecode.
- Eventos emitidos.
- Codigo fuente, si esta verificado.

## Abrir un contrato

Si tu contrato fue desplegado en Sepolia, abre:

```text
https://sepolia.etherscan.io/address/TU_DIRECCION
```

Reemplaza `TU_DIRECCION` por la direccion real.

Ejemplo de forma:

```text
https://sepolia.etherscan.io/address/0x1234567890abcdef1234567890abcdef12345678
```

## Pestana Transactions

Muestra las transacciones relacionadas con la direccion.

Para un contrato nuevo, normalmente veras una transaccion de creacion.

Datos utiles:

- Hash de transaccion.
- Bloque.
- Timestamp.
- From.
- To.
- Valor.
- Fee.

## Pestana Contract

Aqui puedes ver informacion del contrato.

Si no esta verificado, Etherscan mostrara bytecode, pero no el codigo Solidity legible.

Si esta verificado, podras ver:

- Codigo fuente.
- ABI.
- Funciones de lectura.
- Funciones de escritura.

## Read Contract

La seccion `Read Contract` permite llamar funciones que no modifican estado.

Ejemplos:

- Leer una variable `public`.
- Consultar un mapping.
- Ver el owner de un contrato.
- Consultar balances.

Estas llamadas no cuestan gas porque no crean transacciones.

## Write Contract

La seccion `Write Contract` permite ejecutar funciones que modifican estado.

Para usarla necesitas conectar MetaMask.

Estas llamadas:

- Requieren firma.
- Pueden gastar gas.
- Pueden fallar si no cumples requisitos.
- Cambian el estado del contrato si se ejecutan correctamente.

## Eventos

Los eventos son logs que un contrato emite durante una transaccion.

En Etherscan puedes verlos dentro de los detalles de la transaccion.

Los eventos son utiles para:

- Historial de acciones.
- Indexacion.
- Interfaces frontend.
- Auditoria de actividad.

## Contrato no aparece inmediatamente

Despues de desplegar, puede tardar unos segundos en verse.

Si no aparece:

- Confirma que estas en Sepolia Etherscan.
- Verifica que la direccion sea correcta.
- Revisa el hash de transaccion.
- Espera confirmaciones.

## Ver no es lo mismo que verificar

Ver un contrato significa encontrar su direccion en el explorador.

Verificar un contrato significa subir y comprobar el codigo fuente para que Etherscan lo muestre de forma legible.

El siguiente documento explica la verificacion.
