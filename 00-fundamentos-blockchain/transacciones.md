# Transacciones en Ethereum

Las transacciones son uno de los conceptos más importantes de Ethereum.

Cada vez que queremos realizar una acción que modifique el estado de la blockchain necesitamos, normalmente, enviar una:

```text
Transaction
```

Por ejemplo:

```text
Enviar ETH
```

```text
Transferir un token
```

```text
Hacer mint de un NFT
```

```text
Ejecutar deposit()
```

```text
Ejecutar swap()
```

```text
Desplegar un smart contract
```

Todas estas operaciones terminan involucrando una transacción.

Podemos visualizar el proceso general:

```text
Usuario
   ↓
Wallet
   ↓
Construye Transaction
   ↓
Firma
   ↓
RPC
   ↓
Ethereum
   ↓
Mempool
   ↓
Bloque
   ↓
EVM
   ↓
Nuevo Estado
```

Comprender este flujo será fundamental cuando utilicemos:

```text
Solidity

Hardhat

ethers.js

MetaMask

DeFi

dApps
```

---

# 1. ¿Qué es una transacción?

Una transacción es una operación firmada que se envía a una blockchain para solicitar una modificación de su estado.

Por ejemplo, Alice tiene:

```text
Alice = 5 ETH
Bob   = 1 ETH
```

Alice quiere enviar:

```text
2 ETH
```

a Bob.

Alice crea una transacción.

Después de ejecutarse:

```text
Alice ≈ 3 ETH
Bob   = 3 ETH
```

Alice tendrá algo menos de 3 ETH porque también tendrá que pagar:

```text
gas
```

---

# 2. Una transacción produce una transición de estado

Podemos pensar Ethereum como una máquina de estados.

Antes:

```text
Estado A
```

Ejecutamos:

```text
Transaction
```

Después:

```text
Estado B
```

Conceptualmente:

```text
Estado anterior
      +
Transacción válida
      ↓
EVM
      ↓
Nuevo estado
```

Esta idea conecta directamente con lo aprendido en:

```text
ethereum.md
```

y:

```text
evm.md
```

---

# 3. Ejemplo

Tenemos un contrato:

```solidity
contract Counter {

    uint256 public count;

    function increment() external {
        count++;
    }
}
```

Actualmente:

```text
count = 5
```

Alice quiere ejecutar:

```solidity
increment()
```

Alice envía una transacción.

La EVM ejecuta el contrato.

Resultado:

```text
count = 6
```

Por tanto:

```text
Transaction
↓
Execution
↓
State Change
```

---

# 4. Leer no es lo mismo que enviar una transacción

Esta diferencia es fundamental.

Podemos interactuar con Ethereum mediante:

```text
READ
```

o:

```text
WRITE
```

---

# 5. Lectura

Supongamos:

```solidity
function getCount()
    external
    view
    returns (uint256)
{
    return count;
}
```

Consultar:

```text
getCount()
```

normalmente puede hacerse utilizando una llamada RPC.

Conceptualmente:

```text
Application
↓
RPC
↓
Node
↓
EVM simulation
↓
Result
```

No necesitamos crear una transacción on-chain.

---

# 6. Escritura

Supongamos:

```solidity
function increment() external {
    count++;
}
```

Esta función modifica:

```text
storage
```

Por tanto necesitamos:

```text
Transaction
```

Conceptualmente:

```text
Wallet
↓
Signature
↓
Transaction
↓
Ethereum
↓
EVM
↓
Storage Change
```

---

# 7. Regla mental

```text
READ
↓
normalmente eth_call
↓
no cambia estado
```

Mientras:

```text
WRITE
↓
transaction
↓
puede cambiar estado
```

---

# 8. ¿Quién puede crear una transacción?

Tradicionalmente una transacción Ethereum comienza desde una:

```text
EOA
```

o cuenta controlada mediante claves.

La cuenta utiliza su:

```text
private key
```

para firmar.

Conceptualmente:

```text
Private Key
      ↓
Signature
      ↓
Transaction
```

Los smart contracts pueden ejecutar llamadas a otros contratos durante una transacción, pero no poseen una private key para iniciar una transacción tradicional por sí solos.

---

# 9. Wallet

Normalmente no construimos manualmente una transacción byte por byte.

Una:

```text
Wallet
```

nos ayuda a:

* seleccionar una cuenta;
* construir la transacción;
* estimar gas;
* mostrar los datos;
* firmar;
* transmitirla a la red.

Conceptualmente:

```text
Usuario
↓
Wallet
↓
Transaction
↓
Signature
↓
Network
```

---

# 10. Una transacción contiene información

De manera simplificada, una transacción puede contener información como:

```text
from

to

value

data

nonce

chainId

gas limit

fee parameters

signature
```

Cada campo tiene una función diferente.

---

# 11. `from`

`from` representa la cuenta que envía la transacción.

Ejemplo:

```text
from:
0xAlice...
```

Conceptualmente:

```text
Alice
↓
signs
↓
Transaction
```

La dirección del sender puede recuperarse a partir de la firma de la transacción.

---

# 12. `to`

`to` representa el destino.

Puede ser:

```text
EOA
```

o:

```text
Smart Contract
```

Ejemplo:

```text
to:
0xBob...
```

Si Alice envía ETH a Bob:

```text
Alice
↓
Transaction
↓
Bob
```

---

# 13. `value`

`value` representa cuánto ETH nativo se envía junto con la transacción.

Ejemplo:

```text
value = 1 ETH
```

Conceptualmente:

```text
Alice
↓
1 ETH
↓
Bob
```

---

# 14. `value` puede ser cero

Una transacción no necesita enviar ETH.

Por ejemplo:

```solidity
counter.increment();
```

puede tener:

```text
value = 0
```

pero aun así ejecutar código.

---

# 15. `data`

`data` contiene información adicional enviada con la transacción.

Cuando interactuamos con un smart contract, aquí aparece la llamada codificada.

Por ejemplo queremos ejecutar:

```solidity
transfer(bob, 100);
```

La transacción contiene datos que representan:

```text
function selector
+
encoded arguments
```

---

# 16. Calldata

Cuando la EVM ejecuta una llamada al contrato:

```text
transaction.data
```

se utiliza como:

```text
calldata
```

Conceptualmente:

```text
Transaction
│
└── data
     ↓
   EVM
     ↓
calldata
```

---

# 17. Function Selector

Supongamos esta función:

```solidity
function transfer(
    address to,
    uint256 amount
) external;
```

La firma canónica es:

```text
transfer(address,uint256)
```

Se calcula:

```text
keccak256(
    "transfer(address,uint256)"
)
```

y los primeros:

```text
4 bytes
```

se utilizan como:

```text
function selector
```

---

# 18. Estructura conceptual del calldata

Una llamada puede verse así:

```text
┌────────────────┬──────────────────────────┐
│    Selector    │       Arguments          │
│    4 bytes     │     ABI encoded          │
└────────────────┴──────────────────────────┘
```

La EVM utiliza el selector para determinar qué función debe ejecutar el contrato.

---

# 19. Ejemplo

Queremos ejecutar:

```solidity
transfer(
    bob,
    100
);
```

Conceptualmente:

```text
data
│
├── selector de transfer(address,uint256)
│
├── bob
└── 100
```

Todo se codifica en bytes.

---

# 20. ABI Encoding

Los argumentos no se escriben simplemente como:

```text
Bob, 100
```

Ethereum utiliza reglas de codificación llamadas:

```text
ABI Encoding
```

Conceptualmente:

```text
Function
+
Arguments
↓
ABI Encoder
↓
Bytes
↓
Transaction Data
```

Librerías como:

```text
ethers.js
```

se encargan normalmente de realizar esta codificación.

---

# 21. ABI

Para construir correctamente las llamadas necesitamos conocer la:

```text
ABI
```

del contrato.

Ejemplo:

```text
Frontend
↓
ABI
↓
ethers
↓
calldata
↓
Contract
```

Esto explica por qué Hardhat genera:

```text
ABI
```

cuando compilamos contratos.

---

# 22. `nonce`

Uno de los campos más importantes de una transacción es:

```text
nonce
```

El nonce ayuda a ordenar las transacciones enviadas desde una cuenta.

Ejemplo:

```text
Alice

Tx 1 → nonce 0

Tx 2 → nonce 1

Tx 3 → nonce 2
```

---

# 23. ¿Por qué existe el nonce?

Imaginemos que Alice firma:

```text
Enviar 1 ETH a Bob
```

Sin un mecanismo apropiado, alguien podría intentar retransmitir la misma operación una y otra vez.

El nonce ayuda a garantizar que cada transacción normal de una cuenta ocupe una posición específica en su secuencia.

---

# 24. Ejemplo

Alice tiene:

```text
nonce = 5
```

Su siguiente transacción utilizará:

```text
nonce = 5
```

Cuando sea procesada correctamente, la siguiente será:

```text
nonce = 6
```

---

# 25. El nonce pertenece a la cuenta

Cada cuenta tiene su propia secuencia.

Ejemplo:

```text
Alice
nonce = 20
```

```text
Bob
nonce = 3
```

```text
Carol
nonce = 150
```

No existe un único nonce global compartido por todas las cuentas.

---

# 26. El nonce también depende de la red

La misma address puede tener:

```text
Mainnet
nonce = 50
```

y:

```text
Sepolia
nonce = 7
```

porque son blockchains independientes.

Esto conecta con:

```text
redes.md
```

---

# 27. Nonces consecutivos

Supongamos:

```text
Alice

nonce 10
nonce 11
nonce 12
```

La secuencia importa.

Si la transacción:

```text
nonce 10
```

permanece pendiente, las siguientes pueden verse afectadas porque Ethereum debe respetar el orden de las transacciones de esa cuenta.

---

# 28. Transacción bloqueada por nonce

Podemos imaginar:

```text
nonce 10 → pending
nonce 11 → waiting
nonce 12 → waiting
```

Aunque las siguientes tengan condiciones atractivas, la secuencia del sender debe mantenerse.

Esto puede producir la sensación de que varias transacciones:

```text
"están atascadas"
```

---

# 29. `chainId`

Una transacción también está asociada con una red.

Para distinguir redes utilizamos:

```text
chainId
```

Ejemplo:

```text
Ethereum Mainnet
chainId = 1
```

---

# 30. ¿Por qué importa `chainId`?

Queremos evitar confundir una transacción destinada a:

```text
Network A
```

con una destinada a:

```text
Network B
```

El chain ID participa en la firma/protección contra ciertos:

```text
replay attacks
```

entre cadenas.

---

# 31. Gas Limit

Una transacción incluye un límite sobre cuánto gas puede consumir.

```text
gasLimit
```

Ejemplo:

```text
gasLimit = 100,000
```

Esto significa:

> La ejecución puede consumir como máximo 100,000 unidades de gas.

---

# 32. Gas Used

Después de ejecutarse sabemos cuánto gas se utilizó realmente.

Ejemplo:

```text
Gas Limit = 100,000
Gas Used  = 64,382
```

No son lo mismo.

---

# 33. ¿Qué pasa si falta gas?

Supongamos:

```text
Gas Limit = 50,000
```

pero la ejecución necesita:

```text
70,000
```

La transacción puede terminar en:

```text
Out of Gas
```

Los cambios de estado de esa ejecución se revierten.

---

# 34. Fee Parameters

Además del gas limit, una transacción contiene parámetros relacionados con cuánto estamos dispuestos a pagar por cada unidad de gas.

En transacciones modernas aparecen conceptos como:

```text
maxFeePerGas
```

y:

```text
maxPriorityFeePerGas
```

---

# 35. `maxFeePerGas`

Representa el máximo total por unidad de gas que el usuario está dispuesto a pagar.

Ejemplo:

```text
maxFeePerGas = 40 gwei
```

No significa necesariamente que pagará exactamente 40 gwei.

---

# 36. `maxPriorityFeePerGas`

Representa el máximo adicional destinado a prioridad.

Ejemplo:

```text
maxPriorityFeePerGas = 2 gwei
```

Está relacionado con la compensación por inclusión de la transacción.

---

# 37. Base Fee

La red determina una:

```text
base fee
```

por bloque.

La parte correspondiente a la base fee:

```text
se quema
```

en lugar de entregarse directamente al validador.

---

# 38. Effective Gas Price

Finalmente existe un precio efectivo por gas.

De forma simplificada:

```text
Transaction Fee
=
Gas Used
×
Effective Gas Price
```

Este concepto fue explicado con mayor detalle en:

```text
gas.md
```

---

# 39. Tipos de transacciones

Ethereum ha utilizado diferentes formatos de transacciones con el tiempo.

Podemos encontrar conceptos como:

```text
Legacy Transactions
```

```text
Access List Transactions
```

```text
EIP-1559 Transactions
```

y otros tipos introducidos posteriormente para usos específicos.

Para comenzar, las transacciones de estilo EIP-1559 son especialmente importantes.

---

# 40. Legacy Transaction

Históricamente las transacciones utilizaban un campo:

```text
gasPrice
```

Conceptualmente:

```text
Gas Used
×
Gas Price
=
Fee
```

Todavía podemos encontrar este modelo en código y documentación.

---

# 41. EIP-1559 Transaction

Las transacciones modernas pueden utilizar:

```text
maxFeePerGas
```

y:

```text
maxPriorityFeePerGas
```

en lugar de un único `gasPrice`.

Por eso en librerías y receipts podemos encontrar ambos modelos dependiendo del contexto.

---

# 42. Firmar una transacción

Antes de enviar una transacción debemos autorizarla.

La cuenta utiliza su:

```text
private key
```

para producir una:

```text
signature
```

Conceptualmente:

```text
Transaction Data
+
Private Key
↓
Digital Signature
```

---

# 43. ¿Qué demuestra la firma?

La firma permite verificar criptográficamente que la transacción fue autorizada por quien controla la clave correspondiente.

No necesitamos enviar la private key a Ethereum.

Enviamos:

```text
Transaction
+
Signature
```

---

# 44. Nunca enviamos la private key al contrato

Esto sería extremadamente inseguro.

El contrato no necesita conocer:

```text
private key
```

Solo necesita que Ethereum pueda validar:

```text
signature
```

y determinar el sender.

---

# 45. `msg.sender`

Cuando la transacción llama directamente un contrato:

```text
Alice
↓
Contract
```

dentro del contrato:

```solidity
msg.sender
```

será normalmente:

```text
Alice
```

---

# 46. Llamadas entre contratos

Supongamos:

```text
Alice
↓
Contract A
↓
Contract B
```

Dentro de `Contract A`:

```text
msg.sender = Alice
```

Pero dentro de `Contract B`:

```text
msg.sender = Contract A
```

porque el sender inmediato cambió.

---

# 47. `tx.origin`

Solidity también expone:

```solidity
tx.origin
```

que representa el origen EOA de la cadena de llamadas tradicional.

Ejemplo:

```text
Alice
↓
Contract A
↓
Contract B
```

Dentro de `Contract B` podríamos tener:

```text
msg.sender = Contract A
tx.origin  = Alice
```

---

# 48. No uses `tx.origin` para autorización

Un principio de seguridad muy importante:

```text
tx.origin
```

no debería utilizarse como mecanismo normal para autenticar usuarios.

Por ejemplo:

```solidity
require(
    tx.origin == owner,
    "Not owner"
);
```

puede crear vulnerabilidades.

Generalmente las autorizaciones deben diseñarse alrededor de:

```text
msg.sender
```

y patrones de acceso seguros.

Lo estudiaremos en:

```text
02-solidity-intermedio/contracts/09-LlamadasEntreContratos.sol
```

---

# 49. Serialización

Antes de transmitirse, una transacción se representa en un formato codificado.

Conceptualmente:

```text
Transaction fields
↓
Encode
↓
Serialized Transaction
↓
Network
```

Los detalles exactos dependen del tipo de transacción.

Normalmente librerías como ethers manejan este proceso.

---

# 50. Signed Transaction

Después de firmar obtenemos conceptualmente:

```text
Unsigned Transaction
+
Signature
↓
Signed Transaction
```

Esta puede enviarse a un nodo.

---

# 51. RPC

La wallet o nuestra aplicación necesita comunicarse con Ethereum mediante:

```text
RPC
```

Conceptualmente:

```text
Wallet
↓
RPC
↓
Ethereum Node
```

---

# 52. Enviar una transacción

Una transacción firmada puede transmitirse mediante métodos RPC.

Conceptualmente:

```text
Signed Transaction
↓
RPC
↓
Node
↓
P2P Network
```

El nodo valida información básica y puede propagarla a otros participantes.

---

# 53. Broadcasting

Transmitir una transacción a la red suele llamarse:

```text
broadcast
```

Conceptualmente:

```text
Wallet
↓
Node A
↓
Node B
↓
Node C
↓
Network
```

---

# 54. Mempool

Una transacción válida enviada a un nodo puede permanecer temporalmente en una colección de transacciones pendientes.

Frecuentemente hablamos de:

```text
mempool
```

Conceptualmente:

```text
Pending Transactions
│
├── Tx A
├── Tx B
├── Tx C
└── Tx D
```

---

# 55. No existe necesariamente una única mempool global perfecta

Cada nodo puede tener una visión ligeramente distinta de las transacciones pendientes.

Por eso es mejor pensar:

```text
nodos mantienen pools de transacciones pendientes
```

en lugar de imaginar una única base de datos central llamada:

```text
THE MEMPOOL
```

---

# 56. Pending

Cuando una transacción ha sido enviada pero todavía no está incluida en un bloque solemos decir:

```text
pending
```

Flujo:

```text
Created
↓
Signed
↓
Broadcast
↓
Pending
```

---

# 57. El validador incluye transacciones

Los validadores participan en la creación de bloques.

Un bloque puede contener:

```text
Tx A
Tx B
Tx C
```

Cuando nuestra transacción entra en un bloque:

```text
Pending
↓
Included
```

---

# 58. ¿Todas las transacciones pendientes entran inmediatamente?

No.

La inclusión depende de factores como:

* disponibilidad de espacio;
* condiciones de fee;
* validez;
* orden por nonce;
* políticas de nodos/builders;
* condiciones de la red.

Una transacción puede permanecer pendiente durante cierto tiempo.

---

# 59. Transacción incluida

Supongamos:

```text
Block 100
│
├── Tx A
├── Our Tx
└── Tx B
```

Ahora nuestra transacción ya está:

```text
included
```

en un bloque.

---

# 60. Ejecución

Durante la construcción/validación del bloque, la transacción se ejecuta bajo las reglas de Ethereum.

Si llama a un contrato:

```text
Transaction
↓
Contract Address
↓
Runtime Bytecode
↓
EVM
↓
Opcodes
```

---

# 61. Ejemplo completo

Alice llama:

```solidity
counter.increment();
```

Flujo:

```text
Alice
↓
Wallet
↓
Build Transaction
↓
Sign
↓
RPC
↓
Node
↓
Pending
↓
Block
↓
EVM
↓
Counter.increment()
↓
SLOAD
↓
ADD
↓
SSTORE
↓
New State
```

---

# 62. Transaction Hash

Una transacción tiene un identificador llamado:

```text
transaction hash
```

o:

```text
tx hash
```

Suele verse así:

```text
0x...
```

Este hash permite identificar la transacción.

---

# 63. ¿Para qué sirve el transaction hash?

Podemos utilizarlo para:

* buscar la transacción;
* consultar su estado;
* encontrar su receipt;
* verla en un block explorer;
* depurar;
* registrar operaciones.

---

# 64. Transaction Hash no es Address

Ambos pueden comenzar por:

```text
0x
```

pero representan cosas diferentes.

```text
Address
↓
Account / Contract
```

```text
Transaction Hash
↓
Transaction
```

---

# 65. Receipt

Después de que una transacción sea incluida podemos obtener su:

```text
Transaction Receipt
```

El receipt contiene información sobre el resultado de la ejecución.

---

# 66. Información del Receipt

Dependiendo del contexto puede incluir información como:

```text
status

blockNumber

transactionHash

gasUsed

logs

contractAddress
```

entre otros datos.

---

# 67. `status`

Un receipt puede indicar si la ejecución fue:

```text
success
```

o:

```text
failure
```

Conceptualmente:

```text
status = 1
↓
success
```

```text
status = 0
↓
failure
```

---

# 68. Transaction vs Receipt

No confundas:

```text
Transaction
```

con:

```text
Receipt
```

La transaction representa:

```text
lo que intentamos ejecutar
```

El receipt representa información sobre:

```text
lo que ocurrió al ejecutarla
```

---

# 69. Modelo

```text
Transaction
↓
Execution
↓
Receipt
```

Es parecido a:

```text
Request
↓
Processing
↓
Result
```

---

# 70. Logs

Cuando un contrato emite eventos:

```solidity
emit Transfer(
    alice,
    bob,
    100
);
```

la ejecución produce:

```text
logs
```

Estos logs aparecen relacionados con el receipt.

---

# 71. Eventos

Flujo:

```text
Transaction
↓
Token Contract
↓
transfer()
↓
emit Transfer
↓
Log
↓
Receipt
```

Wallets, explorers e indexers pueden procesarlos.

---

# 72. Success

Una transacción exitosa significa que la ejecución terminó correctamente y los cambios de estado correspondientes fueron aplicados.

Ejemplo:

```text
Before:
count = 5
```

```text
increment()
```

```text
Success
```

```text
After:
count = 6
```

---

# 73. Failed Transaction

Una transacción puede ser incluida en un bloque pero fallar durante la ejecución.

Por ejemplo:

```solidity
require(
    amount > 0,
    "Invalid amount"
);
```

Si:

```text
amount = 0
```

la ejecución hace:

```text
revert
```

---

# 74. Revert

Cuando una ejecución revierte:

```text
State changes
↓
discarded
```

Conceptualmente:

```text
Estado A
↓
Execution
↓
Partial Changes
↓
REVERT
↓
Estado A
```

---

# 75. Pero se sigue pagando gas

Aunque la transacción falle:

```text
EVM executed code
```

por lo tanto consumió recursos.

El sender paga por el trabajo ejecutado hasta el fallo según las reglas aplicables.

Por eso:

```text
failed transaction
≠
free transaction
```

---

# 76. Ejemplo de Revert

Contrato:

```solidity
function withdraw(
    uint256 amount
) external {

    require(
        balances[msg.sender] >= amount,
        "Insufficient balance"
    );

    balances[msg.sender] -= amount;
}
```

Alice tiene:

```text
10 TOKEN
```

intenta retirar:

```text
100 TOKEN
```

Resultado:

```text
require fails
↓
revert
↓
state unchanged
```

---

# 77. Atomicidad

Las transacciones Ethereum son:

```text
atomic
```

Conceptualmente:

```text
todo
```

o:

```text
nada
```

respecto a los cambios de estado de esa ejecución.

---

# 78. Ejemplo de atomicidad

Supongamos:

```text
Paso 1
transfer Token A

Paso 2
update balance

Paso 3
transfer Token B

Paso 4
ERROR
```

Si la ejecución revierte:

```text
Paso 1
Paso 2
Paso 3
↓
reverted
```

No debería quedar un estado parcialmente aplicado de esa transacción.

---

# 79. Llamadas internas también revierten

Supongamos:

```text
Transaction
↓
Contract A
↓
Contract B
↓
Contract C
```

Si `Contract C` revierte y el error se propaga sin ser manejado:

```text
Contract C ❌
↓
Contract B ❌
↓
Contract A ❌
↓
Transaction ❌
```

los cambios correspondientes pueden revertirse.

---

# 80. Los errores pueden manejarse

Solidity permite determinados mecanismos para manejar fallos de llamadas externas, por ejemplo:

```solidity
try / catch
```

o comprobando resultados de llamadas de bajo nivel.

Esto significa que no todo fallo interno tiene necesariamente que hacer revert de toda la transacción si el código está diseñado para manejarlo.

Es un concepto más avanzado.

---

# 81. Transaction Confirmations

Después de incluirse nuestra transacción pueden añadirse nuevos bloques.

Ejemplo:

```text
Block 100
└── Our Transaction

Block 101

Block 102

Block 103
```

Podemos hablar de:

```text
confirmations
```

---

# 82. ¿Por qué esperar confirmaciones?

Una aplicación puede decidir esperar más bloques antes de considerar una operación suficientemente asentada.

Por ejemplo:

```text
Transaction included
↓
1 confirmation
↓
2 confirmations
↓
3 confirmations
```

El criterio necesario depende del sistema.

---

# 83. Inclusion vs Finality

No debemos confundir:

```text
sent
```

```text
pending
```

```text
included
```

```text
confirmed
```

```text
finalized
```

Son etapas o conceptos diferentes.

---

# 84. Ciclo de vida

Podemos visualizar:

```text
CREATE
   ↓
SIGN
   ↓
BROADCAST
   ↓
PENDING
   ↓
INCLUDED
   ↓
EXECUTED
   ↓
RECEIPT
   ↓
CONFIRMATIONS
   ↓
FINALITY
```

---

# 85. Esperar una transacción con ethers

Más adelante podremos escribir algo conceptualmente parecido a:

```javascript
const tx = await contract.increment();
```

En ese momento obtenemos información relacionada con la transacción enviada.

Después:

```javascript
const receipt = await tx.wait();
```

esperamos su inclusión/confirmación según la API utilizada.

---

# 86. `tx` no es todavía necesariamente el resultado final

Este patrón:

```javascript
const tx =
    await contract.increment();
```

no significa necesariamente:

```text
la blockchain ya terminó todo
```

Normalmente significa que hemos enviado la transacción y recibido una respuesta con información como su hash.

Después necesitamos esperar:

```text
receipt
```

---

# 87. Ejemplo mental

```javascript
const tx =
    await contract.increment();
```

Conceptualmente:

```text
Transaction sent
↓
tx object
```

Después:

```javascript
const receipt =
    await tx.wait();
```

Conceptualmente:

```text
wait for inclusion
↓
receipt
```

---

# 88. Error común en tests/scripts

Un desarrollador puede hacer:

```javascript
await contract.increment();
```

y continuar inmediatamente sin pensar en el receipt.

Dependiendo de la herramienta y operación, debemos comprender cuándo:

```text
transaction was submitted
```

y cuándo:

```text
transaction was mined / included
```

Hardhat y ethers abstraen muchas cosas, pero entender esta diferencia evita errores.

---

# 89. Contract Deployment también es una transacción

Cuando desplegamos:

```solidity
contract Counter {

}
```

también enviamos una transacción.

Pero aquí existe una diferencia importante.

No estamos enviando la transacción a un contrato existente.

Estamos:

```text
creando uno nuevo
```

---

# 90. Contract Creation Transaction

Una transacción de creación de contrato contiene:

```text
creation bytecode
```

y puede incluir:

```text
constructor arguments
```

Conceptualmente:

```text
EOA
↓
Deploy Transaction
↓
Creation Bytecode
↓
EVM
↓
Constructor
↓
Runtime Bytecode
↓
New Contract Address
```

---

# 91. `to` en un deployment

En una creación tradicional de contrato, el campo de destino no funciona como una llamada normal a una address existente.

Conceptualmente:

```text
to = no recipient contract
```

porque la transacción está solicitando:

```text
create new contract
```

---

# 92. Constructor

Si tenemos:

```solidity
contract Token {

    string public name;

    constructor(
        string memory _name
    ) {
        name = _name;
    }
}
```

durante el deployment:

```text
Creation Bytecode
+
Constructor Argument
↓
EVM
↓
Constructor executes
↓
name stored
↓
Runtime Bytecode returned
```

---

# 93. Receipt del Deployment

Después del deployment podemos obtener información relacionada con:

```text
contract address
```

Además del:

```text
transaction hash
```

Son dos cosas distintas.

---

# 94. Deployment Address

Conceptualmente:

```text
Deploy Transaction
↓
Tx Hash
```

produce:

```text
Contract
↓
Contract Address
```

No confundas:

```text
Deployment Transaction Hash
```

con:

```text
Contract Address
```

---

# 95. Transferir ETH a una EOA

Una transferencia simple:

```text
Alice
↓
1 ETH
↓
Bob EOA
```

tiene normalmente:

```text
to = Bob

value = 1 ETH

data = empty
```

Conceptualmente.

---

# 96. Enviar ETH a un contrato

También podemos enviar ETH hacia:

```text
Smart Contract
```

Pero el contrato debe ser capaz de aceptar esa operación según su código.

Por ejemplo puede definir:

```solidity
receive() external payable {
}
```

---

# 97. `payable`

Para que determinadas funciones reciban ETH deben estar marcadas:

```solidity
payable
```

Ejemplo:

```solidity
function deposit()
    external
    payable
{
}
```

Entonces podemos enviar:

```text
value > 0
```

junto con la llamada.

---

# 98. `msg.value`

Dentro del contrato podemos consultar:

```solidity
msg.value
```

Ejemplo:

```solidity
function deposit()
    external
    payable
{
    balances[msg.sender]
        += msg.value;
}
```

Si Alice envía:

```text
1 ETH
```

entonces:

```text
msg.value = 1 ETH
```

---

# 99. `msg.data`

Dentro del contexto de ejecución también existe:

```solidity
msg.data
```

que contiene el calldata completo de la llamada.

Conceptualmente:

```text
msg.data
│
├── function selector
└── encoded arguments
```

---

# 100. `msg.sender`

También:

```solidity
msg.sender
```

representa el caller inmediato.

Y:

```solidity
msg.value
```

el ETH enviado en la llamada actual.

Estas variables pertenecen al:

```text
execution context
```

---

# 101. Transferencia ERC-20

Cuando hacemos:

```solidity
token.transfer(
    bob,
    100
);
```

no estamos enviando ETH directamente a Bob.

Estamos enviando una transacción a:

```text
Token Contract
```

Conceptualmente:

```text
Alice
↓
Transaction
↓
ERC-20 Contract
↓
transfer(Bob, 100)
↓
update balances
```

---

# 102. Campos conceptuales ERC-20

La transacción podría verse conceptualmente:

```text
from:
Alice

to:
Token Contract

value:
0 ETH

data:
transfer(Bob, 100)
```

El movimiento de tokens ocurre dentro del estado del smart contract.

---

# 103. Approval también es una transacción

Cuando ejecutamos:

```solidity
approve(
    dex,
    100
);
```

modificamos:

```text
allowance
```

en storage.

Por tanto:

```text
approve
↓
Transaction
↓
Gas
```

---

# 104. Swap también es una transacción

Un swap DeFi puede provocar muchas llamadas internas.

```text
Alice
↓
Router
↓
Pool
↓
Token A
↓
Token B
↓
Events
↓
Storage Changes
```

Pero desde el punto de vista de Alice puede comenzar con:

```text
una sola transacción
```

---

# 105. Una transacción puede ejecutar muchos contratos

Esto es fundamental.

Una sola transacción puede producir:

```text
Contract A
↓
Contract B
↓
Contract C
↓
Contract D
```

Todas esas llamadas ocurren dentro de la ejecución iniciada por la transacción.

---

# 106. Internal Transactions

En exploradores podemos encontrar términos como:

```text
Internal Transactions
```

Pero debemos tener cuidado.

Las llamadas entre contratos no son necesariamente nuevas transacciones Ethereum independientes firmadas.

Conceptualmente:

```text
1 external transaction
↓
many internal calls
```

Es más preciso pensar en:

```text
message calls
```

o llamadas internas durante la ejecución.

---

# 107. Ejemplo

Alice envía:

```text
Tx #1
```

al:

```text
DEX Router
```

Después:

```text
Router
↓
Pool
↓
Token A
↓
Token B
```

No significa que Alice haya firmado cuatro transacciones diferentes.

---

# 108. Transaction Trace

Para depurar una ejecución podemos analizar:

```text
transaction trace
```

Conceptualmente:

```text
Transaction
│
├── CALL Contract A
│    │
│    ├── CALL Contract B
│    │
│    └── CALL Contract C
│
└── RETURN
```

Hardhat y otras herramientas pueden ayudarnos a comprender estas ejecuciones.

---

# 109. Transaction Ordering

El orden de las transacciones dentro de un bloque puede importar.

Ejemplo:

```text
Tx A
↓
changes price

Tx B
↓
executes swap
```

Si cambiamos el orden:

```text
Tx B
↓
Tx A
```

el resultado puede ser diferente.

---

# 110. El estado cambia entre transacciones

Supongamos:

```text
State 0
↓
Tx A
↓
State 1
↓
Tx B
↓
State 2
↓
Tx C
↓
State 3
```

Cada transacción ejecuta contra el estado resultante de las anteriores según el orden del bloque.

---

# 111. Esto importa en DeFi

En protocolos financieros:

```text
price

liquidity

balances

reserves
```

pueden cambiar entre transacciones.

Por eso el orden puede tener consecuencias económicas.

Este tema aparecerá más adelante cuando estudiemos:

```text
MEV
```

---

# 112. Front-running

De forma simplificada, un actor puede intentar hacer que su transacción sea ejecutada antes de otra que ha observado.

Conceptualmente:

```text
Victim Tx
↓
visible pending
```

Un actor intenta:

```text
Attacker Tx
↓
before Victim Tx
```

Esto aparece especialmente en sistemas financieros.

Lo estudiaremos en seguridad/DeFi.

---

# 113. Slippage

Por esa razón los swaps suelen utilizar protecciones como:

```text
minimum amount out
```

o:

```text
slippage tolerance
```

porque el estado puede cambiar antes de que la transacción sea finalmente ejecutada.

---

# 114. Estado al firmar vs estado al ejecutar

Supongamos que Alice prepara una transacción cuando:

```text
price = 100
```

Pero antes de ejecutarse otra transacción cambia:

```text
price = 110
```

La transacción de Alice ejecutará contra:

```text
el estado existente en el momento de ejecución
```

no necesariamente contra el estado que veía cuando pulsó:

```text
Confirm
```

---

# 115. Deadline

Algunos protocolos permiten especificar una:

```text
deadline
```

para evitar que una operación se ejecute demasiado tarde.

Conceptualmente:

```text
if current time > deadline
↓
revert
```

Esto puede ser importante en operaciones sensibles a cambios de mercado.

---

# 116. Estimación de Gas

Antes de firmar una transacción, la wallet puede intentar simularla para estimar:

```text
gas
```

Conceptualmente:

```text
Proposed Transaction
↓
Simulation
↓
Estimated Gas
```

---

# 117. Una estimación también puede detectar errores

Si una simulación encuentra:

```text
revert
```

la wallet puede advertir:

```text
transaction likely to fail
```

antes de enviarla.

Pero una simulación no garantiza completamente el resultado futuro si el estado cambia.

---

# 118. Simulación vs ejecución real

```text
Simulation
↓
uses current/predicted state
↓
no permanent state change
```

Mientras:

```text
Real Transaction
↓
included in block
↓
actual execution
↓
state change
```

---

# 119. `eth_call`

Una de las operaciones RPC utilizadas para simulaciones/lecturas es:

```text
eth_call
```

Permite ejecutar una llamada localmente sobre un nodo sin crear una transacción on-chain.

---

# 120. `eth_call` puede simular funciones que modifican estado

Aunque solemos asociar:

```text
eth_call
```

con funciones `view`, técnicamente puede utilizarse para simular una llamada que ejecutaría lógica de escritura.

La diferencia es:

```text
simulation
↓
changes are not persisted
```

Esto es extremadamente útil para:

```text
gas estimation

debugging

preflight checks
```

---

# 121. Firmar no significa enviar

Una distinción importante:

```text
Sign Transaction
```

y:

```text
Broadcast Transaction
```

son pasos diferentes.

Podemos firmar una transacción:

```text
offline
```

y transmitirla después.

---

# 122. Offline Signing

Conceptualmente:

```text
Computer Offline
↓
Private Key
↓
Sign Transaction
↓
Signed Bytes
```

Después:

```text
Online Machine
↓
Broadcast Signed Transaction
```

Esto permite diseños de seguridad más avanzados.

---

# 123. Hardware Wallet

Una hardware wallet puede mantener la private key aislada.

Conceptualmente:

```text
Application
↓
Unsigned Transaction
↓
Hardware Wallet
↓
User Approves
↓
Signature
↓
Application
↓
Broadcast
```

La private key no necesita salir del dispositivo.

---

# 124. Revisar antes de firmar

Antes de confirmar deberíamos comprobar:

```text
Network

To

Value

Contract

Function

Arguments

Token approvals

Gas / Fee
```

Firmar una transacción incorrecta puede tener consecuencias irreversibles.

---

# 125. Signature ≠ Transaction

También podemos firmar:

```text
messages
```

sin crear una transacción.

Por ejemplo:

```text
Sign-In with Ethereum
```

puede pedir una firma sin modificar el estado blockchain.

Por tanto:

```text
signature
≠
transaction
```

---

# 126. Message Signature

Conceptualmente:

```text
Message
+
Private Key
↓
Signature
```

No necesariamente:

```text
Gas
```

ni:

```text
Blockchain Transaction
```

---

# 127. Transaction Signature

En cambio:

```text
Transaction
+
Private Key
↓
Signed Transaction
↓
Broadcast
↓
Blockchain
```

puede producir cambios de estado y consumir gas.

---

# 128. Approve vs Sign

Otra diferencia importante:

```text
ERC-20 approve()
```

es normalmente:

```text
on-chain transaction
```

Mientras firmar un mensaje:

```text
off-chain signature
```

puede no modificar estado.

---

# 129. Nonce Replacement

Supongamos que Alice envió:

```text
nonce = 10
```

pero permanece pendiente.

Alice puede intentar enviar otra transacción con:

```text
nonce = 10
```

y condiciones de fee suficientemente superiores.

La nueva transacción puede:

```text
replace
```

la anterior.

---

# 130. Speed Up

Cuando una wallet muestra:

```text
Speed Up
```

normalmente intenta crear una transacción:

```text
same nonce
+
higher fee
```

Conceptualmente:

```text
Old Tx
nonce 10
fee low
```

```text
New Tx
nonce 10
fee higher
```

Solo una puede ocupar finalmente esa posición de nonce en la cadena canónica.

---

# 131. Cancel Transaction

Cuando una wallet muestra:

```text
Cancel
```

no puede borrar mágicamente una transacción ya propagada.

Normalmente intenta reemplazarla.

Por ejemplo:

```text
same nonce
↓
send 0 ETH to yourself
↓
higher fee
```

Si la nueva transacción entra primero, la original ya no podrá ejecutarse con ese nonce.

---

# 132. Cancel no está garantizado

Existe una carrera:

```text
Original Transaction
```

vs:

```text
Replacement Transaction
```

Si la original se incluye primero:

```text
cancel failed
```

porque el nonce ya fue consumido.

---

# 133. Una transacción confirmada no se cancela así

El mecanismo de reemplazo funciona con transacciones:

```text
pending
```

Una vez que una transacción ya fue incluida y consolidada:

```text
no podemos simplemente cancelarla
```

mediante otra transacción con el mismo nonce.

---

# 134. Nonce Too Low

Podemos encontrar errores como:

```text
nonce too low
```

Esto puede significar que estamos intentando utilizar un nonce que ya ha sido consumido.

Ejemplo:

```text
Current expected nonce = 12

Transaction nonce = 10
```

---

# 135. Replacement Underpriced

También podemos encontrar errores relacionados con:

```text
replacement transaction underpriced
```

cuando intentamos reemplazar una transacción pero las nuevas condiciones de fee no cumplen los requisitos del nodo.

---

# 136. Pending Nonce

Cuando enviamos varias transacciones es importante distinguir conceptos como:

```text
confirmed nonce
```

y:

```text
pending nonce
```

Las librerías normalmente nos ayudan a manejar esto.

Pero scripts concurrentes pueden causar conflictos.

---

# 137. Problema con scripts paralelos

Supongamos que dos procesos leen:

```text
next nonce = 10
```

al mismo tiempo.

Proceso A envía:

```text
nonce 10
```

Proceso B también intenta:

```text
nonce 10
```

Podemos generar conflictos o reemplazos accidentales.

Esto será importante en sistemas de producción.

---

# 138. Transaction Manager

Aplicaciones que envían muchas transacciones suelen necesitar gestionar cuidadosamente:

```text
nonces

pending transactions

retries

fees

confirmations
```

No basta con llamar:

```text
sendTransaction()
```

sin estrategia.

---

# 139. Transaction Reordering

Las transacciones de una misma EOA deben respetar su secuencia de nonce.

Pero transacciones de cuentas diferentes pueden ordenarse de distintas maneras dentro de bloques.

Ejemplo:

```text
Alice nonce 5
```

y:

```text
Bob nonce 20
```

no tienen una relación global de orden basada en esos nonces.

---

# 140. Transaction Cost

El coste total de una transacción depende principalmente de:

```text
Gas Used
×
Effective Gas Price
```

Pero el gas utilizado depende de:

```text
code path

storage state

calldata

contract calls

EVM operations
```

---

# 141. `value` y fee son diferentes

Supongamos:

```text
value = 1 ETH
```

y:

```text
fee = 0.002 ETH
```

Alice gasta aproximadamente:

```text
1.002 ETH
```

pero Bob recibe:

```text
1 ETH
```

La comisión es independiente del `value`.

---

# 142. Balance necesario

Para enviar una transacción con ETH debemos poder cubrir:

```text
Value
+
Maximum required fee
```

Si no tenemos saldo suficiente la transacción no podrá enviarse/procesarse normalmente.

---

# 143. Transferir ERC-20

Alice puede tener:

```text
1000 USDC
```

pero:

```text
0 ETH
```

Entonces puede no ser capaz de ejecutar:

```solidity
usdc.transfer(...)
```

porque necesita ETH para pagar el gas en Ethereum.

---

# 144. Transaction Data puede ser peligrosa

Una wallet puede mostrar:

```text
Contract Interaction
```

en lugar de algo simple como:

```text
Send 1 ETH
```

Debemos comprender qué función estamos autorizando.

Por ejemplo:

```text
approve(spender, amount)
```

puede conceder permisos importantes.

---

# 145. Firmar datos ilegibles

Muchas estafas intentan conseguir que el usuario firme:

```text
datos que no entiende
```

Regla importante:

```text
Do not blindly sign
```

Debemos revisar:

* dominio;
* red;
* contrato;
* función;
* cantidad;
* permisos;
* contexto.

---

# 146. Una transacción puede ser irreversible

Después de que una transacción válida sea ejecutada y finalizada, normalmente no existe:

```text
Undo
```

como en una base de datos bancaria centralizada.

Si enviamos:

```text
ETH
```

a la dirección equivocada, Ethereum no tiene un administrador central que pueda revertirla por nosotros.

---

# 147. Smart Contract también puede ser irreversible

Si interactuamos con un contrato malicioso:

```text
Transaction
↓
Contract
↓
Bad Logic
↓
Funds Lost
```

la blockchain ejecutará las reglas del contrato si la transacción es válida.

Por eso la seguridad es crítica.

---

# 148. Revert no protege de todo

Un revert protege la atomicidad de una ejecución fallida.

Pero si la lógica maliciosa se ejecuta:

```text
correctamente según el contrato
```

la transacción puede terminar con:

```text
status = success
```

aunque para el usuario el resultado sea malo.

---

# 149. Success ≠ Safe

Esto es extremadamente importante.

```text
Transaction Success
```

solo significa:

```text
la EVM ejecutó la transacción sin revert
```

No significa:

```text
la operación era legítima
```

ni:

```text
el usuario no fue estafado
```

---

# 150. Block Explorer

Podemos utilizar un block explorer para inspeccionar una transacción.

Normalmente podremos observar información como:

```text
Status

Block

From

To

Value

Transaction Fee

Gas

Input Data

Logs
```

---

# 151. Input Data

Un explorer puede intentar decodificar:

```text
transaction data
```

si conoce la ABI.

Entonces algo ilegible como:

```text
0xa9059cbb...
```

puede mostrarse como:

```text
transfer(
    to,
    amount
)
```

---

# 152. Verified Contract

Si el código de un contrato está verificado en un explorer, este puede facilitar:

```text
source code

ABI

function decoding

event decoding
```

Esto ayuda a inspeccionar transacciones.

---

# 153. Contract Verification no significa seguridad

Un contrato:

```text
verified
```

significa normalmente que se ha demostrado una relación entre el bytecode desplegado y determinado código fuente.

No significa automáticamente:

```text
audited
```

```text
safe
```

```text
trustworthy
```

---

# 154. Transaction Simulation Tools

Antes de firmar operaciones complejas pueden utilizarse herramientas que simulan:

```text
state changes

token transfers

approvals
```

Esto puede ayudar a detectar resultados inesperados.

Pero ninguna herramienta elimina completamente el riesgo.

---

# 155. Hardhat y transacciones

Cuando lleguemos a Hardhat podremos realizar:

```text
deployments

contract calls

tests

transaction debugging
```

sobre una blockchain local.

Esto nos permitirá observar todas estas ideas sin utilizar dinero real.

---

# 156. Ejemplo Hardhat mental

```text
Hardhat Test
↓
Signer Alice
↓
Contract.increment()
↓
Transaction
↓
Local Network
↓
EVM
↓
Receipt
↓
Assertions
```

---

# 157. Cuentas de Hardhat

Hardhat nos proporciona cuentas de desarrollo con ETH ficticio.

Podremos enviar:

```text
Transaction 1

Transaction 2

Transaction 3
```

y observar:

```text
nonces

balances

gas

receipts

events
```

sin riesgos económicos.

---

# 158. Tests de transacciones

Podremos comprobar cosas como:

```text
¿cambió el balance?
```

```text
¿emitió el evento?
```

```text
¿revirtió?
```

```text
¿quién fue msg.sender?
```

```text
¿cuánto ETH recibió el contrato?
```

---

# 159. Expect Revert

Por ejemplo podremos comprobar que:

```solidity
withdraw(100)
```

revierte cuando el usuario no tiene saldo suficiente.

Conceptualmente:

```text
Tx
↓
Contract
↓
require fails
↓
revert
↓
test passes
```

si ese era el comportamiento esperado.

---

# 160. Snapshot y Reset

Una red local nos permitirá:

```text
Take Snapshot
↓
Execute Transactions
↓
Change State
↓
Revert Snapshot
```

Esto facilita tests reproducibles.

---

# 161. Impersonation

En forks locales también podremos simular operaciones desde determinadas cuentas.

Conceptualmente:

```text
Mainnet Fork
↓
Impersonate Account
↓
Execute Local Transaction
```

Esto ocurre únicamente en nuestro entorno de prueba.

No significa controlar la private key real de esa cuenta en Mainnet.

---

# 162. Mainnet Fork

Podremos tomar un estado de Mainnet:

```text
Ethereum
↓
Fork
↓
Hardhat Local
```

y ejecutar transacciones ficticias contra protocolos existentes.

Esto será especialmente útil en:

```text
DeFi
```

y:

```text
Auditoría
```

---

# 163. Flash Loans y atomicidad

Más adelante veremos operaciones complejas donde una única transacción puede:

```text
borrow
↓
trade
↓
arbitrage
↓
repay
```

todo dentro de la misma ejecución.

Si no se devuelve el préstamo correctamente:

```text
entire transaction reverts
```

Esto es posible gracias a la atomicidad.

---

# 164. Una transacción puede hacer muchísimo

Una sola transacción puede:

```text
Transfer Token A

Call Protocol A

Call Protocol B

Mint Token C

Burn Token D

Emit Events

Transfer ETH
```

y todo puede ejecutarse de forma atómica.

---

# 165. Pero tiene límites

Una transacción sigue limitada por:

```text
Gas
```

y por las reglas del protocolo.

No podemos ejecutar una cantidad infinita de trabajo.

Si consume demasiado:

```text
Out of Gas
```

---

# 166. Block Gas

Los bloques también tienen límites relacionados con cuánto gas pueden contener.

Esto limita cuánto trabajo computacional total puede introducirse en un bloque.

Conceptualmente:

```text
Block
│
├── Tx A → gas
├── Tx B → gas
├── Tx C → gas
└── ...
```

---

# 167. Transaction Ordering y MEV

El hecho de que:

```text
order matters
```

crea oportunidades económicas relacionadas con:

```text
MEV
```

o:

```text
Maximal Extractable Value
```

Por ejemplo:

```text
arbitrage

liquidations

sandwich attacks
```

Este tema pertenece a etapas más avanzadas.

---

# 168. Sandwich Attack

De forma extremadamente simplificada:

```text
Victim Swap
```

es observado.

Un actor intenta ordenar:

```text
Attacker Tx
↓
Victim Tx
↓
Attacker Tx
```

para aprovechar el cambio de precio.

Esto muestra por qué:

```text
transaction ordering
```

puede importar económicamente.

---

# 169. Private Transactions

Existen mecanismos que intentan enviar transacciones mediante rutas que no las exponen inmediatamente de la misma forma que una difusión pública tradicional.

Esto puede utilizarse en determinados contextos relacionados con:

```text
MEV protection
```

pero es un tema avanzado.

---

# 170. Reorg

En blockchains pueden ocurrir situaciones donde la cadena considerada canónica cambia en sus bloques recientes.

Conceptualmente:

```text
Chain A
↓
reorganization
↓
Chain B
```

Esto ayuda a entender por qué:

```text
included
```

no siempre debe interpretarse inmediatamente como:

```text
absolutamente final
```

---

# 171. Finality

Ethereum posee mecanismos de consenso relacionados con:

```text
finality
```

que proporcionan garantías más fuertes sobre bloques.

Para desarrollo básico no necesitamos dominar todavía los detalles internos.

Basta recordar:

```text
sent
≠
included
≠
finalized
```

---

# 172. Transaction Lifecycle completo

```text
┌──────────────────────────────┐
│           USER               │
└──────────────┬───────────────┘
               │
               ▼
        Create Transaction
               │
               ▼
          Estimate Gas
               │
               ▼
           Sign Data
               │
               ▼
      Signed Transaction
               │
               ▼
          RPC Provider
               │
               ▼
             Node
               │
               ▼
          Broadcast
               │
               ▼
           Pending
               │
               ▼
          Included
               │
               ▼
             EVM
               │
               ▼
       Smart Contract Calls
               │
               ▼
        State Transition
               │
               ▼
            Receipt
               │
               ▼
        Confirmations
               │
               ▼
           Finality
```

---

# 173. Anatomía simplificada

Podemos pensar una transacción como:

```text
Transaction
│
├── Network
│   └── chainId
│
├── Sender
│   └── signature
│
├── Ordering
│   └── nonce
│
├── Destination
│   └── to
│
├── ETH
│   └── value
│
├── Contract Call
│   └── data
│
└── Execution Cost
    ├── gas limit
    └── fee parameters
```

---

# 174. Ejemplo: enviar ETH

Alice envía:

```text
1 ETH
```

a Bob.

Conceptualmente:

```text
from:
Alice

to:
Bob

value:
1 ETH

data:
empty

nonce:
12

chainId:
1

gas:
...

fees:
...

signature:
...
```

---

# 175. Ejemplo: ERC-20 Transfer

Alice envía:

```text
100 TOKEN
```

a Bob.

Conceptualmente:

```text
from:
Alice

to:
Token Contract

value:
0 ETH

data:
transfer(Bob, 100)

nonce:
13

chainId:
1

gas:
...

fees:
...

signature:
...
```

---

# 176. Ejemplo: Deposit

Alice llama:

```solidity
deposit()
```

enviando:

```text
2 ETH
```

Conceptualmente:

```text
from:
Alice

to:
Bank Contract

value:
2 ETH

data:
deposit()

nonce:
14

gas:
...

signature:
...
```

---

# 177. Ejemplo: Deploy

Alice despliega:

```text
Counter
```

Conceptualmente:

```text
from:
Alice

to:
contract creation

value:
possibly 0 ETH

data:
creation bytecode
+
constructor arguments

nonce:
15

gas:
...

signature:
...
```

---

# 178. Ejemplo completo con Counter

Contrato:

```solidity
contract Counter {

    uint256 public count;

    event Incremented(
        address indexed user,
        uint256 newCount
    );

    function increment() external {

        count++;

        emit Incremented(
            msg.sender,
            count
        );
    }
}
```

Alice pulsa:

```text
Increment
```

---

# 179. Paso 1 — Frontend

El frontend utiliza la ABI para construir:

```text
increment()
```

y obtener el calldata correspondiente.

---

# 180. Paso 2 — Wallet

La wallet prepara algo parecido a:

```text
to:
Counter Address

value:
0

data:
increment selector

nonce:
next Alice nonce

chainId:
current network

gas:
estimated

fees:
estimated
```

---

# 181. Paso 3 — Firma

Alice revisa:

```text
network

contract

fee
```

y confirma.

La wallet produce:

```text
signature
```

---

# 182. Paso 4 — Broadcast

```text
Signed Transaction
↓
RPC
↓
Node
↓
Network
```

La transacción queda pendiente.

---

# 183. Paso 5 — Inclusión

Un bloque incluye la transacción.

```text
Block
│
└── Alice Transaction
```

---

# 184. Paso 6 — EVM

La EVM carga:

```text
Counter Runtime Bytecode
```

y procesa el:

```text
function selector
```

hasta encontrar:

```text
increment()
```

---

# 185. Paso 7 — Storage

Antes:

```text
count = 5
```

La EVM realiza conceptualmente:

```text
SLOAD
↓
5
↓
ADD 1
↓
6
↓
SSTORE
```

---

# 186. Paso 8 — Event

El contrato ejecuta:

```solidity
emit Incremented(
    Alice,
    6
);
```

La EVM produce:

```text
log
```

---

# 187. Paso 9 — Nuevo estado

Ahora:

```text
count = 6
```

El estado ha cambiado.

---

# 188. Paso 10 — Receipt

Podemos obtener:

```text
Transaction Receipt
```

con información como:

```text
status = success

gasUsed = ...

logs = Incremented(...)

blockNumber = ...
```

---

# 189. Todo el flujo

```text
Alice
↓
Frontend
↓
ABI Encode
↓
Wallet
↓
Build Transaction
↓
Sign
↓
RPC
↓
Node
↓
Mempool
↓
Block
↓
EVM
↓
Counter.increment()
↓
Storage Change
↓
Event
↓
Receipt
↓
New State
```

Este es uno de los modelos mentales más importantes de todo el repositorio.

---

# 190. Errores comunes

## Error 1

```text
Llamar una función
=
siempre una transacción
```

Incorrecto.

Una lectura puede realizarse mediante:

```text
eth_call
```

sin transacción on-chain.

---

## Error 2

```text
Firmar
=
enviar
```

Incorrecto.

Podemos firmar una transacción sin transmitirla todavía.

---

## Error 3

```text
Transaction sent
=
transaction confirmed
```

Incorrecto.

Puede seguir:

```text
pending
```

---

## Error 4

```text
Transaction included
=
absolute finality immediately
```

No necesariamente.

Debemos distinguir inclusión, confirmaciones y finality.

---

## Error 5

```text
Failed Transaction
=
free
```

Incorrecto.

Una ejecución fallida también puede consumir gas.

---

## Error 6

```text
value
=
transaction fee
```

Incorrecto.

Son cosas diferentes.

---

## Error 7

```text
ERC-20 transfer
=
ETH transfer
```

Incorrecto.

En ERC-20 llamamos al contrato del token.

---

## Error 8

```text
Transaction Hash
=
Contract Address
```

Incorrecto.

Son identificadores diferentes.

---

## Error 9

```text
Cancel
=
delete transaction
```

Incorrecto.

Normalmente intenta reemplazar una transacción pendiente utilizando el mismo nonce.

---

## Error 10

```text
Transaction success
=
transaction safe
```

Incorrecto.

`success` solo indica que no ocurrió un revert.

---

## Error 11

```text
msg.sender
=
siempre la EOA original
```

Incorrecto.

En llamadas entre contratos:

```text
msg.sender
```

cambia con el caller inmediato.

---

## Error 12

```text
tx.origin
=
buena autorización
```

Incorrecto.

No debemos utilizarlo como mecanismo normal de access control.

---

## Error 13

```text
nonce
=
número global de transacción
```

Incorrecto.

Cada cuenta mantiene su propia secuencia.

---

## Error 14

```text
Same address
=
same nonce everywhere
```

Incorrecto.

Cada red tiene su propio estado.

---

## Error 15

```text
Internal transaction
=
otra transacción firmada por el contrato
```

No necesariamente.

Normalmente estamos observando llamadas internas realizadas durante la ejecución de una transacción.

---

# 191. Preguntas de repaso

Intenta responder:

1. ¿Qué es una transacción?
2. ¿Por qué necesitamos una transacción para modificar estado?
3. ¿Una lectura `view` necesita siempre una transacción?
4. ¿Qué representa `from`?
5. ¿Qué representa `to`?
6. ¿Qué representa `value`?
7. ¿Qué representa `data`?
8. ¿Qué es calldata?
9. ¿Qué es un function selector?
10. ¿Cuántos bytes tiene?
11. ¿Qué es ABI encoding?
12. ¿Qué es un nonce?
13. ¿Por qué existe?
14. ¿El nonce es global?
15. ¿El mismo address tiene el mismo nonce en todas las redes?
16. ¿Qué es `chainId`?
17. ¿Qué es `gasLimit`?
18. ¿Qué diferencia existe entre gas limit y gas used?
19. ¿Qué es `maxFeePerGas`?
20. ¿Qué es `maxPriorityFeePerGas`?
21. ¿Qué es una firma?
22. ¿La private key se envía a Ethereum?
23. ¿Qué es `msg.sender`?
24. ¿Qué ocurre con `msg.sender` cuando un contrato llama a otro?
25. ¿Qué es `tx.origin`?
26. ¿Por qué no debe utilizarse normalmente para autorización?
27. ¿Qué significa broadcast?
28. ¿Qué significa pending?
29. ¿Qué es la mempool?
30. ¿Existe necesariamente una única mempool central?
31. ¿Qué significa que una transacción fue incluida?
32. ¿Qué es un transaction hash?
33. ¿Qué es un receipt?
34. ¿Qué diferencia existe entre transaction y receipt?
35. ¿Qué son los logs?
36. ¿Qué ocurre cuando una transacción hace revert?
37. ¿Una transacción fallida puede consumir gas?
38. ¿Qué significa atomicidad?
39. ¿Qué son las confirmations?
40. ¿Qué diferencia existe entre included y finalized?
41. ¿Un deployment es una transacción?
42. ¿Qué contiene una deploy transaction?
43. ¿Qué diferencia existe entre contract address y deployment tx hash?
44. ¿Qué es `msg.value`?
45. ¿Qué hace `eth_call`?
46. ¿Firmar un mensaje es lo mismo que enviar una transacción?
47. ¿Qué significa reemplazar una transacción?
48. ¿Cómo funciona conceptualmente `Speed Up`?
49. ¿Cómo funciona conceptualmente `Cancel`?
50. ¿Qué ocurre si dos transacciones utilizan el mismo nonce?
51. ¿Qué significa `nonce too low`?
52. ¿Por qué importa el orden de las transacciones?
53. ¿Qué significa MEV?
54. ¿Una sola transacción puede llamar múltiples contratos?
55. ¿Qué significa transaction trace?
56. ¿Por qué debemos revisar una transacción antes de firmarla?
57. ¿Una transacción exitosa significa que es segura?
58. ¿Qué relación existe entre ABI y transaction data?
59. ¿Qué relación existe entre gas y ejecución?
60. ¿Cuál es el ciclo completo de una transacción?

---

# 192. Lo que todavía NO necesitas dominar

Todavía no necesitas conocer en profundidad:

```text
RLP encoding

Typed transaction envelopes

EIP-2718

Access Lists

EIP-2930

Raw transaction encoding

Signature r / s / v internals

ECDSA mathematics

secp256k1

Transaction trie internals

Receipt trie

Bloom filters

MEV-Boost

PBS

Private order flow

Builder relays

Bundle mechanics

Account abstraction transactions

UserOperations

Paymasters

Blob transactions

Transaction propagation internals
```

Todos estos conceptos tendrán mucho más sentido después de trabajar con transacciones reales utilizando Hardhat.

---

# 193. Conceptos fundamentales

Después de este archivo debes poder reconocer:

### Transaction

Solicitud firmada capaz de producir cambios de estado.

### From

Cuenta que origina la transacción.

### To

Destino de la transacción.

### Value

Cantidad de ETH enviada.

### Data

Bytes utilizados para llamadas y otros datos.

### Nonce

Número utilizado para ordenar las transacciones de una cuenta.

### Chain ID

Identifica la red.

### Gas Limit

Máximo gas disponible para la ejecución.

### Signature

Autorización criptográfica de la transacción.

### Transaction Hash

Identificador de la transacción.

### Mempool

Conjunto distribuido de transacciones pendientes conocidas por nodos.

### Receipt

Información sobre el resultado de la ejecución.

### Revert

Fallo que descarta los cambios de estado correspondientes.

### Confirmation

Bloques posteriores a la inclusión de una transacción.

### Finality

Garantía más fuerte de que un bloque forma parte definitivamente de la cadena según el consenso.

---

# 194. Relación con Ethereum

```text
Ethereum
↓
State Machine
```

La transacción proporciona:

```text
input
```

La EVM realiza:

```text
execution
```

y obtenemos:

```text
new state
```

Por tanto:

```text
Old State
+
Transaction
↓
EVM
↓
New State
```

---

# 195. Relación con Wallets

```text
Wallet
↓
Build Transaction
↓
Sign Transaction
↓
Broadcast
```

La wallet es la interfaz que normalmente conecta:

```text
User
```

con:

```text
Ethereum
```

---

# 196. Relación con Gas

```text
Transaction
↓
EVM Execution
↓
Opcodes
↓
Gas Used
↓
Transaction Fee
```

Por eso cada transacción que ejecuta trabajo on-chain puede requerir una comisión.

---

# 197. Relación con Networks

Toda transacción pertenece a un contexto de red.

```text
Transaction
↓
chainId
↓
Network
```

Por eso debemos verificar siempre:

```text
¿En qué red estoy?
```

antes de firmar.

---

# 198. Relación con Tokens

Una transferencia ERC-20 es:

```text
Transaction
↓
Token Contract
↓
transfer()
↓
Balances Change
```

No es un movimiento especial fuera del modelo normal de Ethereum.

---

# 199. Relación con Hardhat

Hardhat nos permitirá convertir toda esta teoría en práctica.

Podremos hacer:

```text
Signer
↓
Transaction
↓
Hardhat Network
↓
EVM
↓
Contract
↓
Receipt
```

y observar cada paso sin utilizar fondos reales.

---

# 200. Mapa mental final

```text
                     USER
                      │
                   WALLET
                      │
              BUILD TRANSACTION
                      │
       ┌──────────────┼──────────────┐
       │              │              │
     nonce           to            data
       │              │              │
     value         chainId          gas
       └──────────────┼──────────────┘
                      │
                    SIGN
                      │
                SIGNATURE
                      │
                  BROADCAST
                      │
                     RPC
                      │
                    NODE
                      │
                  PENDING
                      │
                   BLOCK
                      │
                     EVM
                      │
              SMART CONTRACT
                      │
             ┌────────┼────────┐
             │        │        │
           Stack    Memory   Storage
                               │
                         STATE CHANGE
                               │
                            EVENTS
                               │
                            RECEIPT
                               │
                        CONFIRMATIONS
```

---

# 201. Regla mental definitiva

Cuando pulses:

```text
Confirm
```

en una wallet, imagina:

```text
1. ¿Qué network estoy usando?

2. ¿Qué address está firmando?

3. ¿Cuál es el nonce?

4. ¿A qué address va la transaction?

5. ¿Cuánto ETH envío?

6. ¿Qué calldata estoy autorizando?

7. ¿Qué contrato voy a ejecutar?

8. ¿Qué permisos estoy concediendo?

9. ¿Cuánto gas puede consumir?

10. ¿Qué fee estoy dispuesto a pagar?

11. ¿Qué cambios de estado puede producir?
```

Después:

```text
Sign
↓
Broadcast
↓
Pending
↓
Block
↓
EVM
↓
Execution
↓
Receipt
↓
New State
```

Si entiendes este flujo, ya comprendes una de las piezas centrales del funcionamiento de Ethereum.

---

# 202. Siguiente paso

Con este archivo podemos conectar prácticamente todos los fundamentos:

```text
Ethereum
↓
State Machine
```

```text
Wallet
↓
Signs
```

```text
Transaction
↓
Requests State Change
```

```text
Network
↓
Receives Transaction
```

```text
EVM
↓
Executes
```

```text
Gas
↓
Measures Work
```

```text
Smart Contract
↓
Changes State
```

```text
Receipt
↓
Describes Result
```

Después de completar:

```text
wallets.md
```

ya tendremos todo el modelo necesario para pasar de:

```text
00-fundamentos-blockchain/
```

a:

```text
01-fundamentos-solidity/
```

y comenzar a construir smart contracts desde cero.

---

# Resumen

Una transacción es una operación firmada que solicita a Ethereum ejecutar una acción capaz de modificar su estado.

Su anatomía básica puede pensarse como:

```text
Transaction
│
├── nonce
├── to
├── value
├── data
├── chainId
├── gas
├── fee parameters
└── signature
```

Su ciclo de vida:

```text
Create
↓
Sign
↓
Broadcast
↓
Pending
↓
Included
↓
EVM Execution
↓
Receipt
↓
Confirmations
↓
Finality
```

Para llamar un smart contract:

```text
Function
+
Arguments
↓
ABI Encoding
↓
Calldata
↓
Transaction
↓
EVM
↓
Contract
```

Para modificar estado:

```text
Transaction
↓
EVM
↓
Opcodes
↓
Storage
↓
New State
```

Y siempre debemos recordar:

```text
Signed
≠
Sent
```

```text
Sent
≠
Included
```

```text
Included
≠
Finalized
```

```text
Failed
≠
Free
```

```text
Success
≠
Safe
```

```text
Value
≠
Fee
```

```text
Transaction Hash
≠
Contract Address
```

```text
Signature
≠
Transaction
```

La cadena mental más importante es:

```text
User
↓
Wallet
↓
Sign
↓
Transaction
↓
RPC
↓
Network
↓
Block
↓
EVM
↓
Smart Contract
↓
State Change
↓
Receipt
```

Este flujo aparecerá constantemente durante todo el aprendizaje de Solidity, Hardhat, testing, DeFi y seguridad.
