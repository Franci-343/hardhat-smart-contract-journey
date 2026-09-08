# 05 - Errores comunes

En Solidity y Hardhat, equivocarse es parte normal del aprendizaje. Lo importante es aprender a leer el error.

## `HH` o `HHE` seguido de un numero

Hardhat muestra codigos de error para ayudarte a diagnosticar.

Ejemplo:

```text
Error HHE21: Invalid Hardhat config file
```

Esto significa que Hardhat no pudo cargar `hardhat.config.ts`.

Para ver mas detalle:

```bash
npx hardhat compile --show-stack-traces
```

Posibles causas:

- Plugin incompatible.
- Configuracion escrita con sintaxis incorrecta.
- Variable requerida no configurada.
- Version de Node no compatible.
- Dependencias incompletas.

## Contrato no compila

Ejemplo:

```text
ParserError: Expected identifier but got ...
```

Revisa:

- Punto y coma `;`.
- Llaves `{}` bien cerradas.
- Nombre del contrato.
- Version en `pragma solidity`.
- Tipos escritos correctamente.

## Version de Solidity incorrecta

Si el contrato dice:

```solidity
pragma solidity ^0.8.20;
```

pero Hardhat usa otra version incompatible, puede fallar.

En este proyecto la configuracion usa:

```ts
version: "0.8.34"
```

Usa una version compatible en tus contratos:

```solidity
pragma solidity ^0.8.34;
```

## Funcion no encontrada en tests

Si un test llama:

```ts
await contrato.getMessage()
```

pero el contrato no tiene `getMessage`, el test falla.

Solucion:

- Corrige el nombre en el test.
- O agrega la funcion al contrato.
- O recuerda que las variables `public` generan getters automaticos con el mismo nombre de la variable.

## Transaccion revertida

Ejemplo:

```text
VM Exception while processing transaction: reverted
```

Una transaccion puede revertir por:

- Un `require` que no se cumple.
- Un `revert` manual.
- Falta de permisos.
- Envio insuficiente de Ether.
- Llamada a una funcion que no acepta Ether.

En tests, los reverts esperados deben comprobarse explicitamente.

## `payable` faltante

Si intentas enviar Ether a una funcion que no es `payable`, la transaccion falla.

Correcto:

```solidity
function depositar() public payable {
}
```

Tambien puedes recibir Ether con:

```solidity
receive() external payable {
}
```

## Saldo insuficiente

En una red local las cuentas suelen tener Ether falso. En Sepolia necesitas ETH de prueba.

Si ves errores relacionados con fondos:

- Confirma que la cuenta tenga saldo.
- Confirma que estas en la red correcta.
- Confirma que no estas usando una private key equivocada.

## Variable de entorno faltante

Para Sepolia necesitas valores como:

```text
SEPOLIA_RPC_URL
SEPOLIA_PRIVATE_KEY
```

Si faltan, Hardhat no puede construir la red `sepolia`.

Nunca subas claves privadas a Git.

## Nonce incorrecto

El nonce es el contador de transacciones de una cuenta.

Puede fallar si:

- Envias varias transacciones al mismo tiempo.
- Una transaccion queda pendiente.
- Cambias de RPC y el estado no coincide.

Soluciones tipicas:

- Esperar.
- Revisar la cuenta en Etherscan.
- Resetear la cuenta en MetaMask para esa red.

## Gas insuficiente

Si una transaccion necesita mas gas del estimado o el gas price es muy bajo, puede fallar o quedarse pendiente.

En testnets normalmente basta con:

- Reintentar.
- Verificar saldo.
- Usar un RPC estable.

## Importante

No leas los errores como si fueran castigos. Leelos como pistas. La habilidad real es aprender a traducir el mensaje de error a una accion concreta.
