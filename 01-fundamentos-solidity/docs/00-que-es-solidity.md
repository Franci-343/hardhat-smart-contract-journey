# 00 - Que es Solidity

Solidity es un lenguaje de programacion creado para escribir smart contracts, es decir, programas que viven en una blockchain compatible con Ethereum.

Un contrato inteligente no es solo un archivo de codigo. Cuando se despliega, queda publicado en una red, recibe una direccion propia y puede ser llamado por usuarios, wallets, scripts, aplicaciones web u otros contratos.

## La idea principal

En una aplicacion tradicional, el backend vive en un servidor controlado por una empresa o una persona. En Web3, una parte de la logica puede vivir en la blockchain.

Por ejemplo, un contrato puede:

- Guardar saldos.
- Recibir Ether.
- Enviar Ether.
- Registrar votos.
- Emitir eventos.
- Validar permisos.
- Crear tokens.
- Ejecutar reglas sin depender de un servidor central.

Eso suena poderoso, pero tambien tiene una consecuencia importante: si despliegas codigo con errores, no puedes editarlo como editarias una API normal. En blockchain, actualizar contratos requiere patrones especiales que aprenderemos mas adelante.

## Como se ve un contrato minimo

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract HelloWorld {
    string public message = "Hola, Solidity";
}
```

Partes importantes:

- `SPDX-License-Identifier`: indica la licencia del codigo.
- `pragma solidity ^0.8.34`: indica la version del compilador.
- `contract HelloWorld`: define un contrato.
- `string public message`: crea una variable de texto publica.

Cuando una variable es `public`, Solidity genera automaticamente una funcion para leerla.

## Solidity se parece a otros lenguajes, pero no es igual

Si ya sabes JavaScript, TypeScript, Java, C# o Python, algunas cosas te pareceran familiares: variables, funciones, condiciones, ciclos y estructuras de datos.

La diferencia es el contexto:

- Cada escritura en blockchain cuesta gas.
- Los datos persistentes se guardan en storage.
- Las transacciones pueden fallar y revertir cambios.
- Los usuarios interactuan mediante direcciones.
- El dinero puede ser parte directa del programa.

Por eso, aprender Solidity no es solo aprender sintaxis. Tambien es aprender a pensar en ejecucion descentralizada, costos, seguridad y permanencia.

## Que es la EVM

La EVM, Ethereum Virtual Machine, es el entorno donde se ejecutan los contratos inteligentes. Solidity se compila a bytecode, y ese bytecode es lo que entiende la EVM.

Flujo simplificado:

1. Escribes un archivo `.sol`.
2. Hardhat compila el contrato.
3. El compilador genera bytecode y ABI.
4. Despliegas el bytecode en una red.
5. Usas el ABI para interactuar con el contrato.

## Que es el ABI

ABI significa Application Binary Interface. Es una descripcion en JSON de las funciones, eventos y errores del contrato.

Las aplicaciones no leen tu archivo `.sol` directamente. Usan el ABI para saber:

- Que funciones existen.
- Que parametros reciben.
- Que valores devuelven.
- Que eventos puede emitir el contrato.

## Que aprenderas en este modulo

Este modulo empieza desde lo basico:

- `01-HelloWorld.sol`: primer contrato.
- `02-Variables.sol`: variables y estado.
- `03-TiposDeDatos.sol`: tipos basicos.
- `04-Funciones.sol`: funciones.
- `05-Visibilidad.sol`: visibilidad.
- `06-Condicionales.sol`: `if`, `else`.
- `07-Loops.sol`: ciclos.
- `08-Arrays.sol`: listas.
- `09-Mappings.sol`: tablas clave-valor.
- `10-Structs.sol`: datos personalizados.
- `11-Enums.sol`: estados finitos.
- `12-Eventos.sol`: logs.
- `13-Errores.sol`: errores personalizados.
- `14-RequireAssertRevert.sol`: validaciones.
- `15-Payable.sol`: pagos con Ether.
- `16-ReceiveFallback.sol`: recepcion directa de Ether.

## Mentalidad correcta

Al principio no memorices todo. Enfocate en entender estas preguntas:

- Que datos guarda el contrato?
- Quien puede cambiar esos datos?
- Que condiciones deben cumplirse?
- Que pasa si la transaccion falla?
- Que costo tiene guardar o modificar informacion?

Solidity se aprende mejor escribiendo contratos pequenos, rompiendolos con tests y corrigiendolos con calma.
