# Ethereum

Ethereum es una red blockchain diseñada para ejecutar programas llamados **smart contracts** o **contratos inteligentes**.

Si Bitcoin demostró que una blockchain podía utilizarse para transferir valor sin depender de un banco, Ethereum amplió la idea permitiendo ejecutar **código dentro de la blockchain**.

Gracias a esto se pueden construir aplicaciones como:

* tokens;
* NFTs;
* exchanges descentralizados;
* protocolos DeFi;
* DAOs;
* sistemas de votación;
* juegos blockchain;
* mercados digitales;
* sistemas de identidad;
* aplicaciones descentralizadas o **dApps**.

Antes de aprender Solidity o Hardhat, necesitamos entender qué es Ethereum y qué ocurre realmente cuando interactuamos con esta red.

---

# 1. ¿Qué es Ethereum?

Ethereum es una **blockchain pública y programable**.

Podemos pensar en ella como una computadora distribuida formada por miles de nodos alrededor del mundo.

En una computadora tradicional ocurre algo parecido a esto:

```text
Usuario
   ↓
Aplicación
   ↓
Servidor
   ↓
Base de datos
```

Por ejemplo, cuando utilizamos una aplicación bancaria:

```text
Usuario
   ↓
Aplicación del banco
   ↓
Servidores del banco
   ↓
Base de datos del banco
```

El banco controla:

* los servidores;
* la base de datos;
* las reglas;
* los permisos;
* los registros.

Ethereum funciona de forma diferente.

```text
Usuario
   ↓
Wallet
   ↓
Ethereum
   ↓
Smart Contract
```

En lugar de existir un único servidor controlado por una empresa, existen muchos computadores ejecutando el mismo protocolo.

Estos computadores se conocen como **nodos**.

---

# 2. Ethereum no es una empresa

Es importante entender esta diferencia.

Ethereum no funciona como:

```text
Google
Amazon
Facebook
Banco
```

Estas organizaciones controlan su infraestructura.

Ethereum es un **protocolo descentralizado**.

No existe un único servidor que contenga toda la red.

Muchos participantes mantienen copias del estado de Ethereum y verifican que las reglas del protocolo se cumplan.

De forma simplificada:

```text
                 ┌──────────┐
                 │  Nodo A  │
                 └────┬─────┘
                      │
┌──────────┐      Ethereum      ┌──────────┐
│  Nodo B  │◄──────────────────►│  Nodo C  │
└──────────┘                     └──────────┘
                      │
                 ┌────▼─────┐
                 │  Nodo D  │
                 └──────────┘
```

Todos trabajan para mantener una visión consistente de la blockchain.

---

# 3. ¿Qué es una blockchain?

Una blockchain es una estructura que permite mantener un historial de información compartido entre muchos participantes.

La información se agrupa en **bloques**.

Conceptualmente:

```text
Bloque 1
   ↓
Bloque 2
   ↓
Bloque 3
   ↓
Bloque 4
```

Cada nuevo bloque contiene información que permite relacionarlo criptográficamente con bloques anteriores.

Esto hace que modificar información histórica sea extremadamente difícil.

En Ethereum, los bloques pueden contener información relacionada con:

* transacciones;
* ejecución de smart contracts;
* transferencias de ETH;
* creación de contratos;
* cambios en el estado de aplicaciones.

---

# 4. Ethereum como máquina de estados

Una de las formas más importantes de entender Ethereum es pensar en ella como una **máquina de estados global**.

El estado representa cómo se encuentra Ethereum en un determinado momento.

Por ejemplo:

```text
Estado actual:

Alice: 5 ETH
Bob:   2 ETH
Carlos: 10 ETH
```

Alice envía `1 ETH` a Bob.

Después de procesar la transacción:

```text
Nuevo estado:

Alice: 4 ETH
Bob:   3 ETH
Carlos: 10 ETH
```

Ethereum pasó de:

```text
Estado A
```

a:

```text
Estado B
```

mediante una transacción.

Podemos representarlo así:

```text
Estado anterior
      +
Transacción
      ↓
Ejecución
      ↓
Nuevo estado
```

Esta idea será extremadamente importante cuando estudiemos:

* transacciones;
* la EVM;
* smart contracts;
* almacenamiento;
* gas.

---

# 5. ¿Qué es ETH?

**ETH**, también llamado Ether, es el activo nativo de Ethereum.

No debemos confundir:

```text
Ethereum → la red/protocolo
ETH      → el activo nativo de la red
```

Una comparación sencilla sería:

```text
Ethereum = infraestructura
ETH      = activo utilizado dentro de esa infraestructura
```

ETH tiene diferentes usos.

Por ejemplo:

* pagar comisiones de red;
* transferir valor;
* interactuar con smart contracts;
* participar en determinados mecanismos económicos de Ethereum;
* utilizar aplicaciones construidas sobre la red.

---

# 6. ETH no es un token ERC-20

Este detalle suele confundir a los principiantes.

ETH es el activo **nativo** de Ethereum.

No fue creado mediante un contrato ERC-20.

Por lo tanto:

```text
ETH ≠ token ERC-20
```

Tokens como los que aprenderemos a crear posteriormente sí pueden implementar el estándar ERC-20.

Por ejemplo:

```text
Smart Contract
      ↓
implementa ERC-20
      ↓
Token
```

ETH, en cambio, existe a nivel del propio protocolo de Ethereum.

---

# 7. ¿Qué es una cuenta en Ethereum?

Ethereum trabaja principalmente con dos tipos de cuentas.

```text
Ethereum Accounts
│
├── Externally Owned Account
│   EOA
│
└── Contract Account
    Smart Contract
```

## Externally Owned Account

Una **EOA** es una cuenta controlada mediante una clave privada.

Normalmente es la cuenta que utilizamos mediante una wallet.

Ejemplo:

```text
Usuario
   ↓
Wallet
   ↓
Clave privada
   ↓
Cuenta Ethereum
```

Una EOA puede:

* tener ETH;
* enviar transacciones;
* recibir ETH;
* interactuar con contratos;
* desplegar contratos.

---

## Contract Account

Un **Contract Account** representa un smart contract desplegado en Ethereum.

Está controlado por código.

Puede:

* almacenar información;
* recibir ETH;
* enviar ETH bajo determinadas condiciones;
* ejecutar funciones;
* interactuar con otros contratos.

Ejemplo conceptual:

```solidity
contract Counter {
    uint256 public number;

    function increment() public {
        number++;
    }
}
```

Una vez desplegado, este contrato tendrá su propia dirección dentro de Ethereum.

---

# 8. ¿Qué es una dirección Ethereum?

Una dirección es un identificador utilizado para representar una cuenta.

Por ejemplo:

```text
0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

Las direcciones normalmente comienzan por:

```text
0x
```

El prefijo `0x` indica que los caracteres siguientes están representados en hexadecimal.

Una dirección puede corresponder a:

```text
EOA
```

o a:

```text
Smart Contract
```

Por tanto, observar una dirección no significa automáticamente que pertenezca a una persona.

---

# 9. ¿Qué es un smart contract?

Un **smart contract** es un programa almacenado y ejecutado dentro de Ethereum.

Los desarrolladores suelen escribir contratos utilizando **Solidity**.

Por ejemplo:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;

    function increment() public {
        count++;
    }
}
```

Después de desplegar este contrato en Ethereum:

```text
Código Solidity
      ↓
Compilación
      ↓
Bytecode
      ↓
Deploy
      ↓
Ethereum
      ↓
Dirección del contrato
```

A partir de ese momento, otras cuentas pueden interactuar con él.

---

# 10. ¿Dónde se ejecutan los smart contracts?

Los smart contracts se ejecutan dentro de un entorno llamado:

# EVM

**Ethereum Virtual Machine**

La EVM puede imaginarse como la computadora virtual que ejecuta el código de Ethereum.

El flujo simplificado sería:

```text
Smart Contract
      ↓
Compilación
      ↓
Bytecode
      ↓
EVM
      ↓
Ejecución
```

Estudiaremos la EVM con mayor profundidad en:

```text
evm.md
```

Por ahora debemos recordar:

> Ethereum es la red y la EVM es el entorno donde se ejecutan los smart contracts.

---

# 11. ¿Qué significa que Ethereum sea descentralizado?

En un sistema centralizado existe una autoridad principal.

Ejemplo:

```text
Usuarios
   ↓
Servidor central
   ↓
Base de datos
```

Si ese servidor deja de funcionar:

```text
Aplicación → caída
```

Ethereum utiliza una arquitectura distribuida.

```text
            Nodo
          ↗
Usuario → Nodo
          ↘
            Nodo
```

Muchos nodos mantienen y verifican información de la red.

Esto permite reducir la dependencia de una única organización.

---

# 12. ¿Qué es un nodo?

Un nodo es un computador que ejecuta software compatible con el protocolo Ethereum.

Dependiendo de su configuración, puede participar en tareas como:

* verificar bloques;
* verificar transacciones;
* mantener información del estado;
* transmitir información hacia otros nodos;
* permitir que aplicaciones consulten Ethereum.

Cuando desarrollamos una dApp, normalmente necesitamos comunicarnos con un nodo.

Ejemplo:

```text
Frontend
   ↓
ethers.js
   ↓
RPC
   ↓
Nodo Ethereum
   ↓
Blockchain
```

Más adelante veremos qué significa **RPC**.

---

# 13. ¿Qué es una red peer-to-peer?

Los nodos de Ethereum se comunican utilizando una arquitectura **peer-to-peer**, normalmente abreviada como:

```text
P2P
```

Esto significa que los participantes pueden comunicarse entre ellos sin depender de un único servidor central.

Conceptualmente:

```text
Nodo A ───── Nodo B
  │           │
  │           │
Nodo C ───── Nodo D
```

Cuando aparece nueva información, los nodos pueden propagarla al resto de la red.

---

# 14. ¿Qué ocurre cuando enviamos ETH?

Supongamos que Alice quiere enviar:

```text
1 ETH
```

a Bob.

Alice utiliza su wallet y crea una transacción.

Simplificando:

```text
Alice
  ↓
Wallet
  ↓
Firma la transacción
  ↓
Transacción enviada
  ↓
Red Ethereum
  ↓
Validación
  ↓
Bloque
  ↓
Nuevo estado
```

Antes:

```text
Alice: 5 ETH
Bob:   2 ETH
```

Después:

```text
Alice: 4 ETH aproximadamente
Bob:   3 ETH
```

Decimos aproximadamente porque Alice también tendrá que pagar una comisión por ejecutar la transacción.

Esa comisión se relaciona con el concepto de:

```text
Gas
```

Lo estudiaremos en:

```text
gas.md
```

---

# 15. ¿Qué ocurre cuando usamos un smart contract?

Supongamos que existe este contrato:

```solidity
contract Counter {
    uint256 public count;

    function increment() public {
        count++;
    }
}
```

Actualmente:

```text
count = 0
```

Alice quiere ejecutar:

```solidity
increment()
```

El proceso conceptual sería:

```text
Alice
  ↓
Wallet
  ↓
Crea una transacción
  ↓
Firma
  ↓
Ethereum
  ↓
EVM ejecuta increment()
  ↓
count cambia
```

Antes:

```text
count = 0
```

Después:

```text
count = 1
```

La blockchain ahora contiene un estado diferente.

---

# 16. Leer vs escribir en Ethereum

Esta diferencia será fundamental cuando desarrollemos smart contracts.

Podemos realizar dos tipos generales de operaciones.

## Leer información

Ejemplo:

```solidity
count()
```

Queremos saber el valor actual.

```text
Blockchain
   ↓
Lectura
   ↓
Usuario
```

La lectura no modifica el estado de Ethereum.

---

## Modificar información

Ejemplo:

```solidity
increment()
```

Esta función modifica:

```text
count
```

Por tanto necesitaremos una transacción.

```text
Usuario
   ↓
Transacción
   ↓
Ethereum
   ↓
Nuevo estado
```

En términos simplificados:

```text
READ
↓
No modifica estado
↓
No necesita transacción on-chain
```

Mientras que:

```text
WRITE
↓
Modifica estado
↓
Necesita transacción
↓
Consume gas
```

Esta diferencia aparecerá constantemente cuando aprendamos Solidity.

---

# 17. Ethereum es determinista

Los nodos de Ethereum deben llegar al mismo resultado al ejecutar una transacción válida.

Supongamos que un contrato contiene:

```solidity
function sum(uint256 a, uint256 b)
    public
    pure
    returns (uint256)
{
    return a + b;
}
```

Si ejecutamos:

```text
sum(2, 3)
```

todos deberían obtener:

```text
5
```

No sería aceptable que:

```text
Nodo A → 5
Nodo B → 7
Nodo C → 3
```

Los contratos deben ejecutarse de manera que el resultado pueda ser reproducido y verificado por los participantes de la red.

---

# 18. Ethereum no puede ejecutar cualquier cosa gratis

Ethereum es una red compartida.

Si los smart contracts pudieran utilizar recursos ilimitados gratuitamente, alguien podría crear un programa como:

```text
while(true) {
    ejecutar();
}
```

Esto podría consumir recursos indefinidamente.

Para evitarlo Ethereum utiliza un sistema llamado:

```text
Gas
```

Cada operación ejecutada por la EVM tiene un determinado coste computacional.

Ejemplo conceptual:

```text
Operación
   ↓
Consume gas
   ↓
Gas tiene un coste
   ↓
Usuario paga comisión
```

Veremos este concepto detalladamente en:

```text
gas.md
```

---

# 19. ¿Qué es el consenso?

Los participantes de Ethereum necesitan ponerse de acuerdo sobre qué información forma parte de la blockchain.

A este proceso se le llama:

```text
consenso
```

Ethereum utiliza **Proof of Stake**.

También se abrevia:

```text
PoS
```

En Proof of Stake existen participantes llamados **validadores** que participan en la creación y validación de bloques siguiendo las reglas del protocolo.

De manera muy simplificada:

```text
Transacciones
      ↓
Validadores
      ↓
Bloques
      ↓
Consenso
      ↓
Blockchain
```

El funcionamiento completo del consenso de Ethereum es mucho más complejo y está fuera del alcance de esta introducción.

Para desarrollar smart contracts no necesitamos dominar inicialmente todos los detalles de Proof of Stake.

---

# 20. ¿Qué es un bloque?

Un bloque contiene información que ha sido incorporada a la blockchain.

De forma simplificada podemos imaginarlo como:

```text
Block #100
│
├── Transaction 1
├── Transaction 2
├── Transaction 3
└── ...
```

Después aparece otro:

```text
Block #101
│
├── Transaction 1
├── Transaction 2
└── ...
```

Y así sucesivamente.

```text
Block 100
    ↓
Block 101
    ↓
Block 102
    ↓
Block 103
```

Cada bloque representa una nueva evolución del estado de Ethereum.

---

# 21. ¿Qué significa on-chain?

Cuando algo ocurre o se almacena directamente en la blockchain decimos que está:

```text
on-chain
```

Ejemplos:

```text
Transferencia de ETH
Estado de un smart contract
Propietario de un NFT
Balance de un token
```

En cambio:

```text
off-chain
```

significa que la información o computación ocurre fuera de la blockchain.

Por ejemplo:

```text
Servidor tradicional
Base de datos PostgreSQL
API externa
Backend Node.js
```

Muchas dApps combinan ambos mundos.

```text
Frontend
   │
   ├── Off-chain
   │
   └── On-chain
         ↓
      Ethereum
```

---

# 22. ¿Ethereum guarda archivos?

No debemos pensar en Ethereum como si fuera Google Drive.

Aunque técnicamente podemos almacenar información dentro de la blockchain, hacerlo puede ser muy costoso.

No sería eficiente guardar directamente:

```text
video.mp4
foto.png
pelicula.mkv
```

dentro del almacenamiento de un smart contract.

Normalmente una aplicación blockchain combina diferentes tecnologías.

Ejemplo:

```text
NFT
│
├── Smart Contract → Ethereum
│
└── Imagen/metadata → almacenamiento externo
```

Esto lo estudiaremos más adelante cuando trabajemos con NFTs y aplicaciones completas.

---

# 23. Ethereum Mainnet

La red principal de Ethereum recibe normalmente el nombre de:

```text
Ethereum Mainnet
```

Es la red donde existe valor económico real.

Cuando una transacción utiliza ETH real en Ethereum Mainnet:

```text
ETH real
    ↓
Transacción
    ↓
Comisión real
```

Por esta razón no comenzaremos nuestros experimentos directamente en Mainnet.

---

# 24. Testnets

Existen redes diseñadas para realizar pruebas.

Se conocen como:

```text
testnets
```

Nos permiten:

* desplegar contratos;
* probar aplicaciones;
* experimentar;
* practicar transacciones;

sin utilizar normalmente ETH de Mainnet.

Conceptualmente:

```text
Desarrollo local
       ↓
Testnet
       ↓
Mainnet
```

Más adelante aprenderemos a desplegar nuestros contratos en diferentes redes.

---

# 25. Red local

Cuando utilicemos Hardhat podremos ejecutar una blockchain local en nuestro propio computador.

Esto será extremadamente útil durante el desarrollo.

```text
Hardhat
   ↓
Blockchain local
   ↓
Cuentas de prueba
   ↓
ETH de prueba
   ↓
Smart contracts
```

Esto permite desarrollar sin gastar dinero real.

Nuestro flujo normalmente será:

```text
Código
  ↓
Compilación
  ↓
Hardhat Network
  ↓
Tests
  ↓
Testnet
  ↓
Mainnet
```

---

# 26. Ethereum y Solidity

Ethereum no es Solidity.

Son conceptos diferentes.

```text
Ethereum
↓
Blockchain / plataforma
```

```text
Solidity
↓
Lenguaje de programación
```

Solidity nos permite escribir smart contracts que pueden ejecutarse dentro de Ethereum.

Ejemplo:

```solidity
contract HelloWorld {

}
```

El camino será:

```text
Solidity
   ↓
Compiler
   ↓
Bytecode
   ↓
EVM
   ↓
Ethereum
```

---

# 27. Ethereum y Hardhat

Ethereum tampoco es Hardhat.

Hardhat es una herramienta para desarrolladores.

Nos ayuda con tareas como:

```text
Compilar contratos
Ejecutar tests
Desplegar contratos
Crear scripts
Levantar una blockchain local
Depurar errores
Interactuar con contratos
```

Podemos visualizar la relación así:

```text
Developer
   ↓
Hardhat
   ↓
Solidity
   ↓
EVM
   ↓
Ethereum
```

Uno de los objetivos de este repositorio será comprender cada una de estas capas.

---

# 28. Ethereum y una dApp

Una aplicación descentralizada suele tener varias capas.

Por ejemplo:

```text
┌──────────────────────────┐
│        Frontend          │
│     React / Next.js      │
└─────────────┬────────────┘
              │
           ethers
              │
┌─────────────▼────────────┐
│          Wallet          │
│       MetaMask/etc       │
└─────────────┬────────────┘
              │
             RPC
              │
┌─────────────▼────────────┐
│        Ethereum          │
│                          │
│     Smart Contracts      │
└──────────────────────────┘
```

A lo largo del repositorio construiremos progresivamente todas estas piezas.

---

# 29. Ejemplo completo

Imaginemos una aplicación muy sencilla:

```text
Contador descentralizado
```

El smart contract contiene:

```solidity
uint256 public count;
```

y una función:

```solidity
function increment() public {
    count++;
}
```

Alice abre la aplicación.

```text
Frontend
```

muestra:

```text
Count: 5
```

Alice pulsa:

```text
Increment
```

Entonces ocurre:

```text
1. El frontend llama a la wallet

2. La wallet prepara la transacción

3. Alice firma la transacción

4. La transacción se envía a Ethereum

5. La red procesa la transacción

6. La EVM ejecuta increment()

7. El contrato modifica count

8. El nuevo estado queda registrado
```

Resultado:

```text
Count: 6
```

Este pequeño ejemplo contiene prácticamente todos los conceptos que estudiaremos:

```text
Wallet
Transacción
Firma
Gas
Nodo
RPC
Ethereum
EVM
Solidity
Smart Contract
Estado
Frontend
```

---

# 30. ¿Por qué Ethereum es importante para un desarrollador?

Ethereum introdujo una infraestructura donde podemos crear programas que manejan activos digitales y reglas verificables mediante blockchain.

Un desarrollador puede programar lógica como:

```text
Si ocurre X
    ↓
ejecutar Y
```

Por ejemplo:

```text
Si Alice deposita 1 ETH
    ↓
registrar su depósito
```

o:

```text
Si Bob posee determinado NFT
    ↓
permitir acceso
```

o:

```text
Si un usuario intercambia Token A
    ↓
entregar Token B
```

Estas reglas pueden formar parte de un smart contract.

---

# 31. Limitaciones de Ethereum

Ethereum también tiene limitaciones.

Entre ellas:

### Coste

Ejecutar operaciones on-chain puede tener un coste.

### Rendimiento

Una blockchain pública no funciona como una base de datos tradicional diseñada para procesar cualquier cantidad de operaciones gratuitamente.

### Almacenamiento

Guardar grandes cantidades de información directamente en contratos puede ser muy costoso.

### Inmutabilidad

Una vez desplegado un contrato, modificar su comportamiento puede ser complicado dependiendo de su arquitectura.

### Seguridad

Un error en un smart contract puede causar pérdidas económicas reales.

Por eso aprenderemos progresivamente:

```text
Solidity
↓
Testing
↓
OpenZeppelin
↓
Seguridad
↓
Auditoría
```

---

# 32. Conceptos que debes recordar

Al terminar este archivo deberías comprender las siguientes ideas.

### Ethereum

Es una blockchain programable donde pueden ejecutarse smart contracts.

### ETH

Es el activo nativo de Ethereum.

### Smart Contract

Programa que vive y se ejecuta dentro de la blockchain.

### EVM

Entorno que ejecuta el bytecode de los smart contracts.

### Wallet

Herramienta que permite gestionar cuentas y firmar transacciones.

### Transacción

Operación que puede modificar el estado de Ethereum.

### Gas

Mecanismo utilizado para medir el coste computacional de las operaciones.

### Nodo

Computador que ejecuta software compatible con Ethereum y participa en la red.

### Estado

Información actual de la blockchain.

### Mainnet

Red principal de Ethereum.

### Testnet

Red utilizada para realizar pruebas.

---

# 33. Mapa mental

Puedes visualizar Ethereum de esta forma:

```text
                         ETHEREUM
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
       Accounts          Blockchain         EVM
          │                 │                 │
     ┌────┴────┐       Transactions      Smart Contracts
     │         │             │                 │
    EOA     Contract        Blocks           Solidity
     │                                           │
   Wallet                                     Bytecode
```

Otra forma:

```text
Usuario
   ↓
Wallet
   ↓
Transacción
   ↓
Nodo
   ↓
Ethereum
   ↓
EVM
   ↓
Smart Contract
   ↓
Nuevo estado
```

Esta segunda representación será especialmente útil durante todo el repositorio.

---

# 34. Preguntas de repaso

Intenta responder estas preguntas antes de continuar.

1. ¿Qué diferencia existe entre Ethereum y ETH?
2. ¿Qué es un smart contract?
3. ¿Qué es la EVM?
4. ¿Qué diferencia existe entre una EOA y un Contract Account?
5. ¿Qué significa modificar el estado de Ethereum?
6. ¿Por qué las operaciones que modifican estado necesitan transacciones?
7. ¿Qué es el gas?
8. ¿Qué es un nodo?
9. ¿Qué diferencia existe entre Mainnet y una testnet?
10. ¿Qué significa que algo esté on-chain?
11. ¿Ethereum es lo mismo que Solidity?
12. ¿Ethereum es lo mismo que Hardhat?

Si todavía no puedes responder alguna, no pasa nada. Todos estos conceptos aparecerán repetidamente durante el recorrido.

---

# 35. Lo que todavía NO necesitas saber

En este punto no necesitas dominar:

```text
Opcodes
Storage slots
Merkle Patricia Tries
ABI encoding
Assembly
Yul
Proxies
Delegatecall
MEV
Account abstraction
Rollups
Zero Knowledge Proofs
```

Todos esos conceptos pertenecen a etapas posteriores.

Nuestro objetivo por ahora es entender el modelo básico:

```text
Usuario
   ↓
Wallet
   ↓
Transacción
   ↓
Ethereum
   ↓
EVM
   ↓
Smart Contract
   ↓
Estado
```

---

# 36. Siguiente paso

Ahora que conocemos la idea general de Ethereum, el siguiente concepto importante es comprender **dónde se ejecutan realmente los smart contracts**.

Continuaremos con:

```text
evm.md
```

donde estudiaremos:

* qué es la Ethereum Virtual Machine;
* cómo ejecuta smart contracts;
* bytecode;
* opcodes;
* memoria;
* storage;
* stack;
* cómo Solidity termina convirtiéndose en instrucciones que Ethereum puede ejecutar.

---

## Resumen

Ethereum puede entenderse como una computadora distribuida capaz de mantener un estado compartido y ejecutar programas llamados smart contracts.

El flujo fundamental que debes recordar durante todo este repositorio es:

```text
Código Solidity
       ↓
Compilación
       ↓
Smart Contract
       ↓
Ethereum
       ↓
EVM
       ↓
Ejecución
       ↓
Cambio de estado
```

Y desde el punto de vista del usuario:

```text
Usuario
   ↓
Wallet
   ↓
Firma
   ↓
Transacción
   ↓
Ethereum
   ↓
Smart Contract
```

Si estas dos ideas están claras, ya tienes la base necesaria para continuar aprendiendo cómo funciona Ethereum internamente.
