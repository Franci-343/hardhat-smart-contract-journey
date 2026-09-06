# Terminología Blockchain y Ethereum

Este archivo funciona como un glosario de referencia para los conceptos que aparecerán a lo largo del repositorio.

No necesitas memorizar todos los términos inmediatamente.

La idea es poder volver aquí cuando encuentres palabras como:

```text
ABI
calldata
gas
nonce
RPC
EVM
wallet
mainnet
storage
```

y recordar rápidamente qué significan.

---

# 1. Address

Una:

```text
address
```

es un identificador utilizado dentro de una red blockchain.

En Ethereum normalmente tiene un formato parecido a:

```text
0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

Una dirección puede representar:

```text
EOA
```

o:

```text
Smart Contract
```

No debemos asumir que toda dirección pertenece a una persona.

---

# 2. ABI

ABI significa:

```text
Application Binary Interface
```

Describe cómo interactuar con un smart contract.

Incluye información sobre:

* funciones;
* parámetros;
* tipos;
* valores retornados;
* eventos;
* errores.

Conceptualmente:

```text
Frontend
↓
ABI
↓
Smart Contract
```

La ABI permite que herramientas como `ethers.js` sepan cómo codificar llamadas al contrato.

---

# 3. Account

Una:

```text
account
```

es una cuenta dentro de Ethereum.

Existen principalmente:

```text
Externally Owned Account
```

y:

```text
Contract Account
```

---

# 4. Block

Un:

```text
block
```

es una estructura que contiene información incorporada a la blockchain.

Puede contener:

```text
transactions
```

y otra información necesaria para mantener la red.

Conceptualmente:

```text
Block 100
↓
Block 101
↓
Block 102
```

---

# 5. Blockchain

Una:

```text
blockchain
```

es un sistema distribuido para mantener un historial compartido de información.

En Ethereum ese historial incluye:

* transacciones;
* contratos;
* cambios de estado;
* balances;
* eventos.

---

# 6. Block Explorer

Un:

```text
block explorer
```

es una aplicación que permite consultar información pública de una blockchain.

Podemos buscar:

```text
address
transaction hash
block
contract
token
```

y consultar información relacionada.

---

# 7. Bytecode

El:

```text
bytecode
```

es el código de bajo nivel que ejecuta la EVM.

Nosotros escribimos:

```solidity
count++;
```

El compilador genera bytecode.

Conceptualmente:

```text
Solidity
↓
Compiler
↓
Bytecode
↓
EVM
```

---

# 8. Calldata

`calldata` contiene los datos enviados a una llamada externa.

Por ejemplo:

```solidity
transfer(address to, uint256 amount)
```

Cuando llamamos:

```text
transfer(Bob, 100)
```

los argumentos llegan codificados en:

```text
calldata
```

Es un área de solo lectura.

---

# 9. Chain

En blockchain:

```text
chain
```

suele utilizarse como forma abreviada de:

```text
blockchain
```

Por ejemplo:

```text
Ethereum chain
```

o:

```text
EVM chain
```

---

# 10. Chain ID

El:

```text
chainId
```

identifica una red blockchain.

Por ejemplo:

```text
Ethereum Mainnet
chainId = 1
```

Dos redes diferentes deberían distinguirse mediante su chain ID.

Regla mental:

```text
chainId
↓
¿en qué red estoy?
```

---

# 11. Client

Un:

```text
Ethereum client
```

es software que implementa partes del protocolo Ethereum.

Permite ejecutar infraestructura necesaria para participar en la red.

No debe confundirse con:

```text
frontend client
```

de una aplicación web.

---

# 12. Compiler

El:

```text
compiler
```

o compilador transforma código fuente en una representación que puede ejecutar la EVM.

Conceptualmente:

```text
Solidity
↓
Compiler
↓
Bytecode
```

Un compilador ampliamente utilizado para Solidity es:

```text
solc
```

---

# 13. Confirmation

Una:

```text
confirmation
```

indica que después del bloque que contiene nuestra transacción se han añadido más bloques.

Conceptualmente:

```text
Block 100
└── nuestra tx

Block 101
Block 102
Block 103
```

La transacción ha acumulado confirmaciones adicionales.

---

# 14. Consensus

El:

```text
consensus
```

es el mecanismo mediante el cual la red llega a acuerdos sobre el estado válido de la blockchain.

Ethereum utiliza:

```text
Proof of Stake
```

---

# 15. Contract

Un:

```text
contract
```

o:

```text
smart contract
```

es un programa desplegado dentro de una blockchain programable.

En Ethereum normalmente escribiremos contratos utilizando:

```text
Solidity
```

---

# 16. Contract Account

Una:

```text
Contract Account
```

es una cuenta asociada a un smart contract.

Tiene:

```text
address
code
storage
balance
```

y su comportamiento está determinado por código.

---

# 17. Contract Address

La:

```text
contract address
```

es la dirección donde se encuentra desplegado un smart contract.

Siempre debemos preguntar:

```text
¿en qué red?
```

porque una dirección aislada no identifica completamente el deployment.

---

# 18. Cross-chain

`cross-chain` describe interacciones entre diferentes blockchains.

Ejemplo:

```text
Chain A
↓
Bridge / Messaging Protocol
↓
Chain B
```

Las blockchains no se comunican automáticamente entre sí.

---

# 19. dApp

`dApp` significa:

```text
Decentralized Application
```

Es una aplicación que utiliza smart contracts u otra infraestructura blockchain.

Ejemplo:

```text
Frontend
↓
Wallet
↓
Ethereum
↓
Smart Contract
```

Una dApp puede seguir teniendo componentes off-chain.

---

# 20. Decentralization

La:

```text
decentralization
```

o descentralización describe un sistema donde el control y la operación no dependen exclusivamente de una única autoridad.

No es una propiedad binaria.

Un sistema puede tener distintos grados de descentralización.

---

# 21. DeFi

DeFi significa:

```text
Decentralized Finance
```

Agrupa aplicaciones financieras construidas principalmente mediante smart contracts.

Ejemplos:

```text
DEX
Lending
Borrowing
Stablecoins
Derivatives
Liquidity Pools
```

---

# 22. Deployment

Un:

```text
deployment
```

es el proceso de crear un smart contract dentro de una blockchain.

Conceptualmente:

```text
Contract
↓
Compile
↓
Deploy Transaction
↓
Blockchain
↓
Contract Address
```

---

# 23. EIP

EIP significa:

```text
Ethereum Improvement Proposal
```

Es una propuesta utilizada para documentar cambios, estándares o mejoras relacionadas con Ethereum.

Por ejemplo:

```text
EIP-1559
```

modificó aspectos importantes del sistema de tarifas.

---

# 24. EOA

EOA significa:

```text
Externally Owned Account
```

Es una cuenta tradicionalmente controlada mediante una clave privada.

Una EOA puede:

* mantener ETH;
* enviar transacciones;
* firmar mensajes;
* desplegar contratos;
* interactuar con contratos.

---

# 25. ERC

ERC significa:

```text
Ethereum Request for Comments
```

Se utiliza para especificaciones y estándares relacionados con aplicaciones Ethereum.

Ejemplos:

```text
ERC-20
ERC-721
ERC-1155
```

---

# 26. ERC-20

`ERC-20` es un estándar ampliamente utilizado para tokens fungibles.

Ejemplo:

```text
1 TOKEN
```

es intercambiable por:

```text
otro 1 TOKEN
```

del mismo contrato.

---

# 27. ERC-721

`ERC-721` es un estándar utilizado para tokens no fungibles.

Cada token puede tener un identificador único:

```text
tokenId
```

Es uno de los estándares asociados con NFTs.

---

# 28. Ether

`Ether` es el activo nativo de Ethereum.

Su símbolo es:

```text
ETH
```

No debemos confundir:

```text
Ethereum
```

con:

```text
Ether
```

Ethereum es la red/protocolo.

Ether es su activo nativo.

---

# 29. ETH

`ETH` es el símbolo del activo nativo de Ethereum.

Se utiliza entre otras cosas para:

```text
pagar gas
```

y transferir valor.

---

# 30. Ethereum

Ethereum es una blockchain programable diseñada para ejecutar smart contracts.

Podemos pensar:

```text
Ethereum
↓
Network / Protocol
```

mientras:

```text
EVM
↓
Execution Environment
```

---

# 31. EVM

EVM significa:

```text
Ethereum Virtual Machine
```

Es el entorno donde se ejecuta el bytecode de los smart contracts.

Conceptualmente:

```text
Solidity
↓
Bytecode
↓
EVM
↓
Execution
```

---

# 32. EVM-Compatible

Una red:

```text
EVM-compatible
```

permite ejecutar aplicaciones o bytecode utilizando un entorno compatible con la Ethereum Virtual Machine.

Eso no significa necesariamente que la red sea Ethereum o una Layer 2 de Ethereum.

---

# 33. Event

Un:

```text
event
```

es un mecanismo utilizado por smart contracts para producir logs.

Ejemplo:

```solidity
event Transfer(
    address indexed from,
    address indexed to,
    uint256 amount
);
```

Los frontends e indexadores pueden consultar estos logs.

---

# 34. Faucet

Un:

```text
faucet
```

es un servicio que proporciona pequeñas cantidades de tokens de prueba.

Por ejemplo:

```text
Developer
↓
Faucet
↓
Sepolia ETH
```

Se utiliza para poder pagar gas en testnets.

---

# 35. Fee

Una:

```text
fee
```

es una comisión.

En Ethereum una transaction fee está relacionada con:

```text
Gas Used
×
Effective Gas Price
```

---

# 36. Finality

La:

```text
finality
```

describe cuándo un bloque puede considerarse final según las reglas del protocolo.

No es exactamente lo mismo que:

```text
transaction sent
```

o:

```text
transaction included
```

---

# 37. Fork

Un:

```text
fork
```

puede referirse a diferentes conceptos según el contexto.

Durante desarrollo podemos hablar de:

```text
Mainnet Fork
```

que copia un estado existente hacia una blockchain local.

```text
Mainnet
↓
copy state
↓
Local Fork
```

Un fork local no modifica Mainnet real.

---

# 38. Frontend

El:

```text
frontend
```

es la interfaz utilizada por el usuario.

Puede estar construido con tecnologías como:

```text
HTML
CSS
JavaScript
React
Next.js
```

En una dApp:

```text
Frontend
↓
Wallet / Provider
↓
Smart Contract
```

---

# 39. Function Selector

El:

```text
function selector
```

es un identificador de 4 bytes utilizado para identificar una función de un smart contract.

Se obtiene a partir de la firma de la función.

Por ejemplo:

```text
transfer(address,uint256)
```

Conceptualmente:

```text
keccak256(function signature)
↓
primeros 4 bytes
```

---

# 40. Fungible

Un activo:

```text
fungible
```

es intercambiable por otra unidad equivalente del mismo activo.

Ejemplo:

```text
1 token
=
1 token
```

si pertenecen al mismo token fungible.

---

# 41. Gas

El:

```text
gas
```

es una unidad utilizada para medir trabajo computacional dentro de Ethereum.

```text
Opcode
↓
consume gas
```

Gas no significa ETH.

```text
Gas
=
trabajo
```

```text
ETH
=
activo utilizado para pagar
```

---

# 42. Gas Limit

El:

```text
gas limit
```

representa la cantidad máxima de gas que una transacción puede utilizar.

Ejemplo:

```text
Gas Limit = 100,000
```

No significa que necesariamente se consumirán las 100,000 unidades.

---

# 43. Gas Used

`Gas Used` es la cantidad de gas realmente consumida durante una ejecución.

Ejemplo:

```text
Gas Limit = 100,000

Gas Used = 62,431
```

---

# 44. Gwei

`Gwei` es una unidad utilizada frecuentemente para expresar precios de gas.

```text
1 ETH
=
1,000,000,000 Gwei
```

También:

```text
1 Gwei
=
10^9 Wei
```

---

# 45. Hash

Un:

```text
hash
```

es el resultado producido por una función criptográfica de hash.

Normalmente se representa como una secuencia de bytes.

Los hashes aparecen constantemente en blockchain:

```text
transaction hashes
block hashes
storage calculations
signatures
Merkle structures
```

---

# 46. Hard Fork

Un:

```text
hard fork
```

es una actualización del protocolo que cambia las reglas seguidas por la red.

Ethereum ha tenido múltiples actualizaciones mediante hard forks.

No debe confundirse necesariamente con:

```text
local mainnet fork
```

utilizado durante desarrollo.

---

# 47. Hardhat

Hardhat es un entorno y conjunto de herramientas para desarrollo de smart contracts.

Nos ayuda a:

* compilar;
* probar;
* desplegar;
* ejecutar scripts;
* utilizar redes locales;
* depurar.

Conceptualmente:

```text
Developer
↓
Hardhat
↓
Solidity / EVM
```

---

# 48. Hexadecimal

`Hexadecimal` es un sistema numérico de base:

```text
16
```

Utiliza:

```text
0-9
A-F
```

En Ethereum veremos frecuentemente valores como:

```text
0x1234abcd
```

El prefijo:

```text
0x
```

indica normalmente representación hexadecimal.

---

# 49. Immutable

En Solidity:

```solidity
immutable
```

permite definir variables que se asignan durante la construcción del contrato y posteriormente no pueden modificarse normalmente.

Ejemplo:

```solidity
address public immutable owner;
```

---

# 50. Indexer

Un:

```text
indexer
```

es un sistema que procesa información blockchain y la organiza para facilitar búsquedas y consultas.

Por ejemplo:

```text
Blockchain
↓
Events
↓
Indexer
↓
Database
↓
Frontend
```

Las dApps no siempre consultan toda su información directamente desde contratos.

---

# 51. L1

`L1` significa:

```text
Layer 1
```

Es una blockchain base.

Ethereum Mainnet es una Layer 1.

---

# 52. L2

`L2` significa:

```text
Layer 2
```

Es una solución o red diseñada para escalar una blockchain base.

En el ecosistema Ethereum muchas L2 procesan actividad y utilizan Ethereum para propiedades fundamentales de su arquitectura.

---

# 53. Library

En Solidity una:

```text
library
```

es una construcción que permite reutilizar funcionalidad.

Ejemplo:

```solidity
library Math {
}
```

No debe confundirse con una librería JavaScript como:

```text
ethers.js
```

---

# 54. Liquidity

`Liquidity` significa:

```text
liquidez
```

Describe la disponibilidad de activos para realizar operaciones financieras.

Es un concepto especialmente importante en:

```text
DeFi
```

---

# 55. Log

Un:

```text
log
```

es información producida durante una ejecución mediante eventos.

Ejemplo:

```solidity
emit Transfer(...);
```

produce información que puede ser consultada off-chain.

---

# 56. Mainnet

`Mainnet` es la red principal de producción.

En Ethereum:

```text
Ethereum Mainnet
```

utiliza ETH real y contiene actividad económica real.

---

# 57. Mapping

Un:

```solidity
mapping
```

es una estructura de datos Solidity que relaciona claves con valores.

Ejemplo:

```solidity
mapping(address => uint256) public balances;
```

Conceptualmente:

```text
Alice
↓
100

Bob
↓
50
```

---

# 58. Memory

`memory` es un área temporal utilizada durante una ejecución de la EVM.

```text
Function starts
↓
Memory exists
↓
Function ends
↓
Memory disappears
```

No es almacenamiento persistente.

---

# 59. Mempool

La:

```text
mempool
```

es el conjunto de transacciones pendientes conocidas por determinados nodos antes de su inclusión en bloques.

Conceptualmente:

```text
Transaction
↓
Pending
↓
Mempool
↓
Block
```

---

# 60. Metadata

`Metadata` significa:

```text
datos sobre otros datos
```

En NFTs, por ejemplo, puede describir:

* nombre;
* imagen;
* atributos;
* descripción.

---

# 61. Mint

`Mint` significa crear nuevas unidades de un token.

Ejemplo:

```text
mint 100 TOKEN
```

provoca que existan nuevas unidades según las reglas del contrato.

---

# 62. Miner

Un:

```text
miner
```

o minero participa en mecanismos de consenso basados en:

```text
Proof of Work
```

Ethereum ya no utiliza Proof of Work para su consenso.

Actualmente utiliza:

```text
Proof of Stake
```

y participantes llamados:

```text
validators
```

---

# 63. Modifier

Un:

```solidity
modifier
```

es una construcción de Solidity que permite reutilizar condiciones o lógica alrededor de funciones.

Ejemplo:

```solidity
modifier onlyOwner() {
    _;
}
```

Lo estudiaremos en fundamentos de Solidity.

---

# 64. Native Token

El:

```text
native token
```

o activo nativo es el activo definido por la propia red.

En Ethereum:

```text
ETH
```

es el activo nativo.

No es un ERC-20 tradicional.

---

# 65. Node

Un:

```text
node
```

es un computador que ejecuta software relacionado con una blockchain y participa en la red.

Puede permitir:

* verificar información;
* almacenar estado;
* transmitir transacciones;
* ofrecer RPC.

---

# 66. Nonce

Un:

```text
nonce
```

es un valor utilizado, entre otras cosas, para ordenar las transacciones enviadas por una cuenta.

Conceptualmente:

```text
Tx 0
nonce = 0

Tx 1
nonce = 1

Tx 2
nonce = 2
```

Ayuda a impedir que una transacción normal de una cuenta sea ejecutada repetidamente como si fuera nueva.

---

# 67. NFT

NFT significa:

```text
Non-Fungible Token
```

Es un token no fungible.

Cada unidad puede representar algo único.

Ejemplo:

```text
NFT #1
≠
NFT #2
```

aunque ambos pertenezcan al mismo contrato.

---

# 68. Off-chain

`Off-chain` significa:

```text
fuera de la blockchain
```

Ejemplos:

```text
Backend Node.js
PostgreSQL
API
Frontend
Cloud Storage
```

No toda dApp necesita almacenar toda su información on-chain.

---

# 69. On-chain

`On-chain` significa que algo ocurre o está registrado directamente dentro de una blockchain.

Ejemplos:

```text
token balances
contract storage
transactions
ownership
```

---

# 70. Opcode

Un:

```text
opcode
```

es una instrucción ejecutable por la EVM.

Ejemplos:

```text
ADD
SLOAD
SSTORE
CALL
MLOAD
```

Cada opcode puede consumir gas.

---

# 71. Oracle

Un:

```text
oracle
```

es un mecanismo que permite proporcionar información externa a smart contracts.

Por ejemplo:

```text
Internet
↓
Oracle
↓
Smart Contract
```

Puede utilizarse para obtener:

* precios;
* datos financieros;
* resultados;
* información del mundo externo.

---

# 72. Out of Gas

`Out of Gas` ocurre cuando una ejecución consume todo el gas disponible antes de finalizar.

```text
Gas available
↓
0
↓
Out of Gas
```

La ejecución falla.

---

# 73. P2P

P2P significa:

```text
Peer-to-Peer
```

Describe una arquitectura donde participantes pueden comunicarse directamente dentro de una red distribuida.

Ethereum utiliza comunicación peer-to-peer entre nodos.

---

# 74. Pending

Una transacción:

```text
pending
```

ha sido enviada pero todavía no ha sido incluida de manera definitiva en un bloque.

Conceptualmente:

```text
Sent
↓
Pending
↓
Included
```

---

# 75. Private Key

Una:

```text
private key
```

es información secreta utilizada para producir firmas criptográficas.

Quien controla una private key puede controlar las acciones autorizadas por esa clave.

Regla fundamental:

```text
Never share your private key
```

Nunca debe publicarse en:

* GitHub;
* Discord;
* capturas de pantalla;
* código;
* tutoriales;
* `.env` comprometidos.

---

# 76. Proof of Stake

`Proof of Stake` es el mecanismo de consenso utilizado por Ethereum.

También se abrevia:

```text
PoS
```

Utiliza participantes llamados:

```text
validators
```

---

# 77. Proof of Work

`Proof of Work` es otro mecanismo de consenso.

También:

```text
PoW
```

Bitcoin utiliza Proof of Work.

Ethereum utilizó Proof of Work históricamente antes de migrar a Proof of Stake.

---

# 78. Provider

Un:

```text
provider
```

es una abstracción utilizada por librerías para conectarse con una blockchain.

Conceptualmente:

```text
Application
↓
Provider
↓
RPC
↓
Node
```

Sirve principalmente para consultar la red y enviar solicitudes RPC.

---

# 79. Proxy

Un:

```text
proxy contract
```

es un patrón utilizado, entre otros casos, para construir contratos actualizables.

Conceptualmente:

```text
User
↓
Proxy
↓
DELEGATECALL
↓
Implementation
```

Es un concepto avanzado y requiere especial cuidado de seguridad.

---

# 80. Public Key

Una:

```text
public key
```

se deriva de una clave privada mediante criptografía de clave pública.

Conceptualmente:

```text
Private Key
↓
Public Key
↓
Address
```

La relación exacta será explicada en:

```text
wallets.md
```

---

# 81. Receipt

Una:

```text
transaction receipt
```

contiene información sobre el resultado de una transacción incluida.

Puede incluir datos como:

* status;
* gas utilizado;
* logs;
* block number;
* transaction hash.

Conceptualmente:

```text
Transaction
↓
Execution
↓
Receipt
```

---

# 82. Reentrancy

`Reentrancy` es una clase de vulnerabilidad relacionada con llamadas externas que permiten reingresar en una función o contrato antes de que el estado esperado haya sido actualizado correctamente.

Conceptualmente:

```text
Contract A
↓
Contract B
↓
calls back
↓
Contract A
```

Será estudiada en:

```text
07-seguridad/
```

---

# 83. Revert

Un:

```text
revert
```

detiene una ejecución y revierte los cambios de estado realizados durante esa ejecución.

Ejemplo:

```solidity
require(amount > 0);
```

Si la condición falla:

```text
Execution
↓
Revert
```

---

# 84. Rollup

Un:

```text
rollup
```

es una tecnología utilizada por muchas Layer 2 para escalar Ethereum.

De manera simplificada:

```text
muchas transacciones
↓
L2
↓
datos / pruebas / compromisos
↓
Ethereum
```

Existen diferentes arquitecturas.

---

# 85. RPC

RPC significa:

```text
Remote Procedure Call
```

Permite que aplicaciones se comuniquen con nodos.

Conceptualmente:

```text
App
↓
RPC
↓
Node
↓
Blockchain
```

---

# 86. RPC URL

Una:

```text
RPC URL
```

es un endpoint al que una aplicación puede enviar solicitudes RPC.

Ejemplo conceptual:

```text
Hardhat
↓
RPC URL
↓
Sepolia Node
```

Nunca debemos asumir que un RPC apunta a la red correcta sin verificarla.

---

# 87. Seed Phrase

Una:

```text
seed phrase
```

o frase de recuperación es una serie de palabras utilizada por muchas wallets para permitir la recuperación de claves.

También puede llamarse:

```text
recovery phrase
```

Debe protegerse con el mismo nivel de seguridad que las claves privadas.

---

# 88. Signer

Un:

```text
signer
```

representa una entidad con capacidad de firmar.

Conceptualmente:

```text
Signer
↓
Private Key
↓
Signature
↓
Transaction
```

En librerías como ethers aparece constantemente la diferencia:

```text
Provider
↓
Read
```

```text
Signer
↓
Sign / Write
```

---

# 89. Signature

Una:

```text
signature
```

es una firma criptográfica.

Permite demostrar que alguien con acceso a una determinada clave privada autorizó un mensaje o transacción.

Conceptualmente:

```text
Data
+
Private Key
↓
Signature
```

---

# 90. Smart Contract

Un:

```text
smart contract
```

es un programa ejecutado dentro de una blockchain como Ethereum.

Puede:

* almacenar estado;
* recibir ETH;
* enviar ETH;
* manejar tokens;
* ejecutar reglas;
* interactuar con otros contratos.

---

# 91. Solidity

`Solidity` es un lenguaje de programación diseñado para desarrollar smart contracts compatibles con la EVM.

Ejemplo:

```solidity
contract Counter {

    uint256 public count;

}
```

---

# 92. Stack

El:

```text
stack
```

es una estructura utilizada intensamente por la EVM durante la ejecución.

Funciona según:

```text
LIFO
```

que significa:

```text
Last In
First Out
```

---

# 93. State

El:

```text
state
```

o estado representa la información actual de una blockchain o contrato.

Ejemplo:

```text
Alice balance = 5 ETH

Counter.count = 10
```

Una transacción puede producir:

```text
Old State
↓
Transaction
↓
New State
```

---

# 94. State Variable

Una:

```text
state variable
```

es una variable Solidity cuyo valor forma parte del estado persistente del contrato.

Ejemplo:

```solidity
uint256 public count;
```

Normalmente utiliza:

```text
storage
```

---

# 95. Storage

`storage` es el almacenamiento persistente de un smart contract.

Ejemplo:

```solidity
uint256 public balance;
```

Su valor puede continuar existiendo entre transacciones.

```text
Transaction 1
balance = 10

Transaction 2
balance sigue siendo 10
```

---

# 96. Storage Slot

Un:

```text
storage slot
```

es una posición dentro del almacenamiento persistente de un contrato.

Cada slot tiene:

```text
32 bytes
```

o:

```text
256 bits
```

---

# 97. Testnet

Una:

```text
testnet
```

es una blockchain utilizada para pruebas.

Permite probar:

* contratos;
* dApps;
* wallets;
* deployments;

sin utilizar normalmente fondos de Mainnet.

---

# 98. Test ETH

`Test ETH` es ETH utilizado dentro de una red de pruebas.

No es el mismo activo que:

```text
Mainnet ETH
```

Se utiliza para pagar gas dentro de la testnet correspondiente.

---

# 99. Token

Un:

```text
token
```

es un activo digital representado mediante reglas blockchain.

En Ethereum muchos tokens son implementados mediante smart contracts.

Ejemplos:

```text
ERC-20
ERC-721
ERC-1155
```

---

# 100. Transaction

Una:

```text
transaction
```

es una operación firmada enviada a la red que puede producir cambios en el estado.

Conceptualmente:

```text
User
↓
Sign
↓
Transaction
↓
Network
↓
EVM
↓
New State
```

---

# 101. Transaction Fee

La:

```text
transaction fee
```

es la comisión asociada con procesar una transacción.

De manera simplificada:

```text
Gas Used
×
Effective Gas Price
=
Transaction Fee
```

---

# 102. Transaction Hash

El:

```text
transaction hash
```

o:

```text
tx hash
```

es un identificador criptográfico asociado a una transacción.

Ejemplo:

```text
0x4a1f...
```

Puede utilizarse para buscar la transacción en un block explorer.

---

# 103. Transaction Receipt

El:

```text
transaction receipt
```

es el resultado registrado de una transacción procesada.

Puede indicarnos:

```text
status
gas used
logs
block
```

---

# 104. Tx

`Tx` es una abreviatura muy utilizada para:

```text
Transaction
```

Por ejemplo:

```text
tx hash
```

significa:

```text
transaction hash
```

---

# 105. Validator

Un:

```text
validator
```

es un participante del mecanismo Proof of Stake de Ethereum.

Los validadores participan en procesos necesarios para mantener el consenso de la red.

---

# 106. Value

Dentro de una transacción Ethereum:

```text
value
```

normalmente representa cuánto ETH nativo se está enviando.

Ejemplo:

```text
value = 1 ETH
```

No debe confundirse con los argumentos enviados dentro del calldata.

---

# 107. Wallet

Una:

```text
wallet
```

es una herramienta utilizada para gestionar claves, cuentas, firmas e interacción con redes blockchain.

Una wallet no contiene literalmente los ETH dentro de la aplicación.

Los balances existen en:

```text
blockchain state
```

La wallet administra las claves necesarias para controlar cuentas.

---

# 108. Web3

`Web3` es un término amplio utilizado para describir tecnologías y aplicaciones relacionadas con:

* blockchain;
* wallets;
* tokens;
* smart contracts;
* protocolos descentralizados.

No tiene una definición técnica única universal.

---

# 109. Wei

`Wei` es la unidad más pequeña de ETH.

```text
1 ETH
=
1,000,000,000,000,000,000 Wei
```

o:

```text
1 ETH
=
10^18 Wei
```

---

# 110. ZK

`ZK` significa:

```text
Zero Knowledge
```

Hace referencia a técnicas criptográficas relacionadas con pruebas de conocimiento cero.

Aparece frecuentemente en:

```text
ZK Rollups
ZK Proofs
ZK-SNARKs
ZK-STARKs
```

Es un concepto avanzado.

---

# Abreviaturas comunes

Durante el repositorio aparecerán muchas abreviaturas.

| Abreviatura | Significado                           |
| ----------- | ------------------------------------- |
| ABI         | Application Binary Interface          |
| DAO         | Decentralized Autonomous Organization |
| dApp        | Decentralized Application             |
| DeFi        | Decentralized Finance                 |
| EIP         | Ethereum Improvement Proposal         |
| EOA         | Externally Owned Account              |
| ERC         | Ethereum Request for Comments         |
| ETH         | Ether                                 |
| EVM         | Ethereum Virtual Machine              |
| L1          | Layer 1                               |
| L2          | Layer 2                               |
| NFT         | Non-Fungible Token                    |
| P2P         | Peer-to-Peer                          |
| PoS         | Proof of Stake                        |
| PoW         | Proof of Work                         |
| RPC         | Remote Procedure Call                 |
| Tx          | Transaction                           |
| ZK          | Zero Knowledge                        |

---

# Términos relacionados con cuentas

```text
Private Key
↓
permite firmar
```

```text
Public Key
↓
se deriva de la private key
```

```text
Address
↓
identifica la cuenta
```

```text
Wallet
↓
gestiona claves y cuentas
```

```text
Signer
↓
firma operaciones
```

Modelo simplificado:

```text
Private Key
     ↓
Public Key
     ↓
Address
```

---

# Términos relacionados con transacciones

```text
Transaction
│
├── from
├── to
├── value
├── data
├── nonce
├── chainId
└── gas parameters
```

Después:

```text
Transaction
↓
Signature
↓
Network
↓
Pending
↓
Block
↓
Receipt
```

---

# Términos relacionados con la EVM

```text
EVM
│
├── Bytecode
│
├── Opcodes
│
├── Stack
│
├── Memory
│
├── Storage
│
└── Calldata
```

El flujo fundamental:

```text
Solidity
↓
Compiler
↓
Bytecode
↓
Opcodes
↓
EVM
```

---

# Términos relacionados con gas

```text
Gas
↓
trabajo computacional
```

```text
Gas Used
↓
trabajo realmente utilizado
```

```text
Gas Limit
↓
máximo permitido
```

```text
Gas Price
↓
precio por unidad
```

```text
Transaction Fee
↓
coste final
```

Modelo simplificado:

```text
Gas Used
×
Effective Gas Price
=
Transaction Fee
```

---

# Términos relacionados con redes

```text
Network
│
├── Chain ID
├── RPC
├── Nodes
├── Blocks
├── Transactions
└── State
```

Entornos principales:

```text
Local
↓
Development
```

```text
Testnet
↓
Testing
```

```text
Mainnet
↓
Production
```

---

# Términos relacionados con smart contracts

```text
Smart Contract
│
├── Address
├── Bytecode
├── Storage
├── Functions
├── Events
└── Balance
```

Para interactuar normalmente necesitamos:

```text
Network
+
Contract Address
+
ABI
+
Provider / Signer
```

---

# Diferencias que debes tener claras

## Ethereum vs ETH

```text
Ethereum
=
red / protocolo
```

```text
ETH
=
activo nativo
```

---

## Wallet vs Address

```text
Wallet
=
herramienta
```

```text
Address
=
identificador
```

---

## Wallet vs Blockchain

La wallet no almacena literalmente tus monedas.

```text
Blockchain
↓
mantiene balances
```

```text
Wallet
↓
administra claves
```

---

## Public Key vs Private Key

```text
Private Key
=
secreta
```

```text
Public Key
=
puede compartirse
```

Nunca compartas tu private key.

---

## Address vs Contract Address

Ambas utilizan el formato de dirección Ethereum.

Una puede pertenecer a:

```text
EOA
```

y otra a:

```text
Contract Account
```

---

## Ethereum vs Solidity

```text
Ethereum
=
blockchain
```

```text
Solidity
=
lenguaje
```

---

## Solidity vs EVM

```text
Solidity
=
código de alto nivel
```

```text
EVM
=
máquina de ejecución
```

---

## Solidity vs Bytecode

```text
Solidity
=
lo que escribe el developer
```

```text
Bytecode
=
lo que ejecuta la EVM
```

---

## Gas vs ETH

```text
Gas
=
medida de trabajo
```

```text
ETH
=
activo utilizado para pagar
```

---

## Gas Limit vs Gas Used

```text
Gas Limit
=
máximo permitido
```

```text
Gas Used
=
cantidad realmente consumida
```

---

## Memory vs Storage

```text
Memory
=
temporal
```

```text
Storage
=
persistente
```

---

## Storage vs Calldata

```text
Storage
=
estado persistente
```

```text
Calldata
=
datos de entrada
```

---

## Read vs Write

```text
Read
↓
consulta
↓
no modifica estado
```

```text
Write
↓
transaction
↓
puede modificar estado
```

---

## Mainnet vs Testnet

```text
Mainnet
=
producción
```

```text
Testnet
=
pruebas
```

---

## Testnet vs Local

```text
Testnet
=
red pública de pruebas
```

```text
Local
=
blockchain controlada por nosotros
```

---

## EVM-Compatible vs Layer 2

```text
EVM-Compatible
=
compatibilidad de ejecución
```

```text
Layer 2
=
arquitectura de escalabilidad
```

Una red EVM-compatible no es automáticamente una L2.

---

## Switch Network vs Bridge

```text
Switch Network
=
cambiar qué blockchain observa la wallet
```

```text
Bridge
=
mecanismo para mover/representar activos o mensajes entre redes
```

---

## Token vs ETH

```text
ETH
=
activo nativo
```

Mientras muchos:

```text
tokens
```

son creados mediante smart contracts.

---

## ERC-20 vs ERC-721

```text
ERC-20
↓
fungible
```

```text
ERC-721
↓
non-fungible
```

---

## Transaction Hash vs Address

```text
Address
↓
cuenta / contrato
```

```text
Transaction Hash
↓
transacción
```

Ambos pueden empezar por:

```text
0x
```

pero representan cosas distintas.

---

# Símbolos que verás constantemente

## `0x`

Indica normalmente que el valor está escrito en hexadecimal.

Ejemplo:

```text
0x1234abcd
```

---

## `=>`

En Solidity aparece en mappings:

```solidity
mapping(address => uint256)
```

Puede leerse conceptualmente como:

```text
address
↓
uint256
```

---

## `wei`

Unidad mínima de ETH.

```text
1 ETH = 10^18 wei
```

---

## `gwei`

Unidad muy utilizada para gas.

```text
1 gwei = 10^9 wei
```

---

# Frases que escucharás frecuentemente

## "Deploy the contract"

Significa:

```text
desplegar el contrato en una blockchain
```

---

## "Call the contract"

Significa:

```text
interactuar con una función del contrato
```

Dependiendo de la función puede ser:

```text
read
```

o:

```text
transaction
```

---

## "Sign the transaction"

Significa utilizar una clave privada para autorizar criptográficamente una transacción.

---

## "Send the transaction"

Significa transmitir la transacción hacia la red.

---

## "The transaction is pending"

Significa que todavía está esperando ser incluida/procesada.

---

## "The transaction reverted"

Significa que la ejecución falló y los cambios de estado de esa ejecución fueron revertidos.

---

## "The contract is on-chain"

Significa que el contrato está desplegado dentro de una blockchain.

---

## "The data is off-chain"

Significa que esos datos están fuera de la blockchain.

---

## "Read from storage"

Significa leer información persistente del contrato.

---

## "Write to storage"

Significa modificar información persistente.

---

## "Connect to an RPC"

Significa utilizar un endpoint para comunicarnos con un nodo blockchain.

---

## "Switch network"

Significa cambiar la red seleccionada en una wallet o aplicación.

No mueve activos automáticamente.

---

## "Fork Mainnet"

Significa crear un entorno local basado en un estado de Ethereum Mainnet.

No significa modificar Mainnet real.

---

# Jerarquía mental

Podemos organizar muchos de estos conceptos así:

```text
Blockchain
│
└── Ethereum
    │
    ├── Network
    │   ├── Mainnet
    │   ├── Testnet
    │   └── Local
    │
    ├── Accounts
    │   ├── EOA
    │   └── Contract Account
    │
    ├── Transactions
    │   ├── Nonce
    │   ├── Gas
    │   ├── Value
    │   └── Data
    │
    └── EVM
        ├── Bytecode
        ├── Opcodes
        ├── Stack
        ├── Memory
        ├── Storage
        └── Calldata
```

---

# Mapa mental del desarrollador

```text
Developer
   ↓
Solidity
   ↓
Hardhat
   ↓
Compiler
   ↓
Bytecode
   ↓
Network
   ↓
EVM
   ↓
Smart Contract
```

Para interactuar:

```text
Developer / User
        ↓
      Wallet
        ↓
      Signer
        ↓
   Transaction
        ↓
       RPC
        ↓
       Node
        ↓
      Network
        ↓
       EVM
        ↓
Smart Contract
```

---

# Mapa mental de una dApp

```text
┌───────────────────────────┐
│         Frontend          │
│      React / Next.js      │
└─────────────┬─────────────┘
              │
           ethers
              │
┌─────────────▼─────────────┐
│          Wallet           │
└─────────────┬─────────────┘
              │
             RPC
              │
┌─────────────▼─────────────┐
│          Network          │
│                           │
│           EVM             │
│            ↓              │
│      Smart Contract       │
└───────────────────────────┘
```

---

# Mapa mental del estado

```text
Estado anterior
      +
Transaction
      ↓
     EVM
      ↓
Smart Contract
      ↓
Opcodes
      ↓
Nuevo estado
```

---

# Mapa mental del coste

```text
Solidity
↓
Bytecode
↓
Opcodes
↓
Gas Used
↓
Effective Gas Price
↓
Transaction Fee
```

---

# Mapa mental de identidad

```text
Private Key
     ↓
Public Key
     ↓
Address
```

Después:

```text
Address
+
Network
↓
Cuenta concreta dentro de una blockchain
```

---

# Mapa mental de un contrato

```text
Network
   ↓
Contract Address
   │
   ├── Runtime Bytecode
   │
   ├── Storage
   │
   └── Balance
```

Para interactuar:

```text
ABI
+
Address
+
Provider / Signer
```

---

# Preguntas de repaso

Intenta responder:

1. ¿Qué diferencia existe entre Ethereum y ETH?
2. ¿Qué diferencia existe entre una wallet y una address?
3. ¿Qué es una private key?
4. ¿Qué es una EOA?
5. ¿Qué es un Contract Account?
6. ¿Qué es la EVM?
7. ¿Qué es bytecode?
8. ¿Qué es un opcode?
9. ¿Qué diferencia existe entre `storage` y `memory`?
10. ¿Qué es `calldata`?
11. ¿Qué es gas?
12. ¿Qué diferencia existe entre `Gas Limit` y `Gas Used`?
13. ¿Qué es Gwei?
14. ¿Qué es una transaction?
15. ¿Qué es un nonce?
16. ¿Qué es un transaction hash?
17. ¿Qué es un receipt?
18. ¿Qué es un block?
19. ¿Qué significa `pending`?
20. ¿Qué significa `revert`?
21. ¿Qué es Mainnet?
22. ¿Qué es una testnet?
23. ¿Qué es una red local?
24. ¿Qué es un chain ID?
25. ¿Qué significa RPC?
26. ¿Qué es un provider?
27. ¿Qué diferencia existe entre provider y signer?
28. ¿Qué es un faucet?
29. ¿Qué es un block explorer?
30. ¿Qué diferencia existe entre on-chain y off-chain?
31. ¿Qué es un token?
32. ¿Qué diferencia existe entre ERC-20 y ERC-721?
33. ¿Qué es una Layer 2?
34. ¿EVM-compatible significa necesariamente Layer 2?
35. ¿Qué es un bridge?
36. ¿Qué significa cross-chain?
37. ¿Qué es un oracle?
38. ¿Qué es DeFi?
39. ¿Qué es una dApp?
40. ¿Qué es Hardhat?

---

# Conceptos fundamentales que debes dominar

Antes de avanzar a Solidity deberías poder reconocer al menos:

```text
Ethereum

ETH

Blockchain

Address

Wallet

Private Key

Transaction

Gas

EVM

Smart Contract

Mainnet

Testnet

RPC

Node
```

No necesitas conocer todavía todos sus detalles internos.

---

# Conceptos que aprenderás durante Solidity

Más adelante aparecerán términos como:

```text
variable

function

visibility

constructor

modifier

mapping

array

struct

enum

event

error

interface

inheritance

library

payable

fallback

receive
```

Estos se explicarán dentro de:

```text
01-fundamentos-solidity/
```

y:

```text
02-solidity-intermedio/
```

---

# Conceptos avanzados que aparecerán después

Cuando avancemos encontraremos:

```text
delegatecall

proxy

upgradeability

storage collision

assembly

Yul

MEV

reentrancy

oracle manipulation

flash loans

slippage

liquidity pools

AMM

Merkle trees

signatures

EIP-712

multisig

account abstraction

fuzzing

invariant testing
```

No necesitas entenderlos todavía.

---

# Regla final

Cuando encuentres un concepto nuevo intenta responder tres preguntas:

```text
1. ¿Qué es?
```

```text
2. ¿Dónde existe?
```

```text
3. ¿Qué función cumple?
```

Por ejemplo:

```text
Gas
```

¿Qué es?

```text
una medida de trabajo computacional
```

¿Dónde aparece?

```text
durante ejecuciones de Ethereum
```

¿Para qué sirve?

```text
limitar y cobrar por recursos computacionales
```

Otro ejemplo:

```text
Wallet
```

¿Qué es?

```text
una herramienta de gestión de cuentas y claves
```

¿Dónde existe?

```text
fuera de la blockchain
```

¿Para qué sirve?

```text
firmar e interactuar con redes
```

Esta forma de pensar ayuda a evitar memorizar definiciones sin comprenderlas.

---

# Resumen

Los conceptos fundamentales del ecosistema se conectan aproximadamente así:

```text
User
↓
Wallet
↓
Private Key
↓
Signature
↓
Transaction
↓
RPC
↓
Node
↓
Ethereum Network
↓
EVM
↓
Smart Contract
↓
Storage
↓
New State
```

Mientras la ejecución:

```text
Smart Contract
↓
Bytecode
↓
Opcodes
↓
Gas
```

y el coste:

```text
Gas Used
×
Effective Gas Price
=
Transaction Fee
```

Los contratos existen dentro de una red concreta:

```text
Chain ID
+
Contract Address
```

y para interactuar con ellos normalmente necesitamos:

```text
Network

RPC

ABI

Contract Address

Provider / Signer
```

Si estos conceptos empiezan a resultarte familiares, ya tienes una base suficientemente buena para entrar en:

```text
01-fundamentos-solidity/
```

donde comenzaremos a escribir nuestros primeros smart contracts.
