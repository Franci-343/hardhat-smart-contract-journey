# EVM — Ethereum Virtual Machine

La **EVM**, o **Ethereum Virtual Machine**, es el entorno donde se ejecutan los smart contracts de Ethereum.

Si Ethereum es la red, la EVM es la máquina virtual que interpreta y ejecuta las instrucciones de los contratos.

Podemos visualizarlo así:

```text
Ethereum
   ↓
EVM
   ↓
Smart Contracts
```

Cuando escribimos un contrato en Solidity, Ethereum no ejecuta directamente el código Solidity.

Primero debe ser compilado.

```text
Solidity
   ↓
Compiler
   ↓
Bytecode
   ↓
EVM
   ↓
Ejecución
```

Comprender la EVM es importante porque nos ayuda a entender:

* cómo se ejecutan los smart contracts;
* cómo funciona el almacenamiento;
* por qué algunas operaciones cuestan más gas;
* qué ocurre realmente cuando llamamos una función;
* cómo funcionan `storage`, `memory` y `calldata`;
* cómo Solidity se convierte en instrucciones;
* por qué existen ciertos errores y vulnerabilidades;
* cómo optimizar contratos.

No necesitamos dominar todos sus detalles desde el principio, pero sí comprender su modelo mental.

---

# 1. ¿Qué es una máquina virtual?

Una máquina virtual es un entorno que simula una computadora.

Por ejemplo:

```text
Programa
   ↓
Máquina Virtual
   ↓
Computadora física
```

La máquina virtual define sus propias reglas sobre:

* memoria;
* instrucciones;
* almacenamiento;
* ejecución;
* datos.

La EVM funciona de manera similar.

Pero en lugar de ejecutar aplicaciones tradicionales, está diseñada para ejecutar:

```text
Smart Contracts
```

---

# 2. ¿Por qué Ethereum necesita una máquina virtual?

Ethereum tiene miles de nodos.

Todos los nodos deben poder ejecutar una transacción y obtener el mismo resultado.

Supongamos que tenemos:

```solidity
function add(uint256 a, uint256 b)
    public
    pure
    returns (uint256)
{
    return a + b;
}
```

Si ejecutamos:

```text
add(2, 3)
```

todos los nodos deben obtener:

```text
5
```

No sería válido que ocurriera:

```text
Nodo A → 5
Nodo B → 7
Nodo C → 9
```

Por eso Ethereum necesita un entorno de ejecución definido de forma precisa.

Ese entorno es la EVM.

---

# 3. La EVM debe ser determinista

La EVM es **determinista**.

Esto significa que:

```text
Mismo estado
+
Misma transacción
=
Mismo resultado
```

Por ejemplo:

```text
Estado inicial:
count = 5
```

Ejecutamos:

```solidity
count++;
```

El resultado debe ser:

```text
count = 6
```

para todos los nodos que ejecuten esa transacción correctamente.

---

# 4. Solidity no es la EVM

Este es un punto importante.

Solidity es un lenguaje de programación.

La EVM no entiende directamente:

```solidity
uint256 public number;
```

La EVM trabaja con instrucciones de bajo nivel.

Por tanto:

```text
Solidity
   ↓
Compilador
   ↓
Bytecode
   ↓
EVM
```

El compilador transforma nuestro código Solidity en instrucciones que la EVM puede ejecutar.

---

# 5. Código fuente vs bytecode

Supongamos este contrato:

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

Nosotros vemos:

```text
Solidity
```

pero Ethereum recibe algo parecido a:

```text
608060405234801561001057600080fd5b50...
```

Esto se llama:

```text
bytecode
```

El bytecode contiene las instrucciones que la EVM debe ejecutar.

---

# 6. ¿Qué es el bytecode?

El bytecode es una representación de bajo nivel del contrato.

Podemos pensar:

```text
Solidity
      ↓
Compilador
      ↓
Bytecode
```

Ejemplo conceptual:

```text
PUSH1
PUSH1
ADD
SSTORE
```

Cada instrucción tiene una función concreta.

Estas instrucciones se llaman:

```text
opcodes
```

---

# 7. ¿Qué es un opcode?

Opcode significa:

```text
Operation Code
```

Son las instrucciones que puede ejecutar la EVM.

Algunos ejemplos:

```text
ADD
MUL
SUB
DIV

SLOAD
SSTORE

MLOAD
MSTORE

CALL
DELEGATECALL

PUSH
POP
```

Por ejemplo:

```text
ADD
```

realiza una suma.

```text
SLOAD
```

lee información del almacenamiento persistente.

```text
SSTORE
```

escribe información en el almacenamiento persistente.

---

# 8. Ejemplo simplificado de ejecución

Imaginemos que queremos calcular:

```text
2 + 3
```

La EVM podría ejecutar algo conceptualmente parecido a:

```text
PUSH 2
PUSH 3
ADD
```

Primero:

```text
Stack:

2
```

Después:

```text
Stack:

3
2
```

Luego:

```text
ADD
```

toma los valores:

```text
3
2
```

y produce:

```text
5
```

Resultado:

```text
Stack:

5
```

---

# 9. La EVM es una máquina basada en stack

La EVM utiliza principalmente una estructura llamada:

```text
Stack
```

Un stack funciona siguiendo el principio:

```text
LIFO
```

que significa:

```text
Last In, First Out
```

El último elemento que entra es el primero que sale.

Ejemplo:

```text
PUSH 5
PUSH 10
PUSH 20
```

Stack:

```text
20
10
5
```

Si hacemos:

```text
POP
```

se elimina:

```text
20
```

y queda:

```text
10
5
```

---

# 10. Tamaño de palabra de la EVM

La EVM trabaja principalmente con palabras de:

```text
256 bits
```

Esto explica por qué Solidity utiliza frecuentemente:

```solidity
uint256
```

La EVM está diseñada naturalmente para trabajar con valores de este tamaño.

Por ejemplo:

```solidity
uint256 number;
```

encaja directamente en una palabra de la EVM.

---

# 11. Componentes principales de la EVM

Para comenzar debemos conocer cuatro áreas fundamentales:

```text
EVM
│
├── Stack
│
├── Memory
│
├── Storage
│
└── Calldata
```

Cada una tiene un comportamiento diferente.

---

# 12. Stack

El stack es utilizado durante la ejecución de instrucciones.

Es:

* temporal;
* rápido;
* limitado;
* utilizado constantemente por la EVM.

Ejemplo conceptual:

```text
Stack
│
├── 15
├── 10
├── 5
└── ...
```

Cuando ejecutamos operaciones matemáticas, la EVM normalmente trabaja con valores almacenados en el stack.

---

# 13. Memory

`memory` es un espacio temporal utilizado durante la ejecución de una llamada.

Ejemplo Solidity:

```solidity
function example()
    public
    pure
    returns (string memory)
{
    string memory message = "hello";

    return message;
}
```

La información almacenada en `memory`:

```text
existe durante la ejecución
```

pero desaparece cuando termina la llamada.

Podemos imaginar:

```text
Inicio función

memory = vacío

   ↓

memory = datos temporales

   ↓

Fin función

memory = destruido
```

---

# 14. Storage

`storage` representa el almacenamiento persistente del contrato.

Ejemplo:

```solidity
contract Counter {

    uint256 public count;

}
```

La variable:

```solidity
count
```

vive en:

```text
storage
```

Si hacemos:

```solidity
count = 10;
```

el valor permanecerá incluso después de terminar la transacción.

```text
Transacción 1
count = 10
```

Más tarde:

```text
Transacción 2
```

seguiremos teniendo:

```text
count = 10
```

---

# 15. Storage vs Memory

La diferencia más importante:

```text
Storage
↓
Persistente
```

```text
Memory
↓
Temporal
```

Ejemplo:

```solidity
uint256 public count;
```

se almacena en:

```text
storage
```

Mientras que:

```solidity
uint256[] memory numbers;
```

vive solamente durante la ejecución.

---

# 16. Storage cuesta más

Modificar `storage` es una de las operaciones más costosas de la EVM.

Por ejemplo:

```solidity
count = 10;
```

requiere una operación relacionada con:

```text
SSTORE
```

Mientras que trabajar con valores temporales en memoria suele ser más barato.

Esto será muy importante cuando estudiemos:

```text
optimización de gas
```

---

# 17. Calldata

`calldata` es el área donde llegan los datos enviados a una función externa.

Supongamos:

```solidity
function setNumber(uint256 number) external {
}
```

Cuando alguien llama:

```text
setNumber(50)
```

la información necesaria para ejecutar esa llamada llega codificada dentro de:

```text
calldata
```

Conceptualmente:

```text
Usuario
   ↓
Transacción
   ↓
Calldata
   ↓
EVM
   ↓
Función
```

---

# 18. Calldata es de solo lectura

Una característica importante:

```text
calldata
```

es:

```text
read-only
```

La función puede leer los datos, pero no modificar el calldata original.

Por ejemplo:

```solidity
function example(uint256[] calldata numbers)
    external
{
}
```

`numbers` existe dentro del calldata de la llamada.

---

# 19. Resumen de las áreas de datos

Podemos visualizar:

```text
                   EVM
                    │
        ┌───────────┼───────────┐
        │           │           │
      Stack       Memory      Storage
        │           │           │
     temporal    temporal    persistente
                    │
                 Calldata
                    │
             datos de entrada
```

Resumen:

```text
Stack
→ operaciones internas

Memory
→ datos temporales

Storage
→ datos permanentes

Calldata
→ datos recibidos por la llamada
```

---

# 20. Ejemplo Solidity

Observa este contrato:

```solidity
contract Example {

    uint256 public total;

    function calculate(
        uint256[] calldata numbers
    )
        external
    {
        uint256 sum;

        for (uint256 i = 0; i < numbers.length; i++) {
            sum += numbers[i];
        }

        total = sum;
    }
}
```

Aquí tenemos:

```text
numbers
↓
calldata
```

```text
sum
↓
valor temporal
```

```text
total
↓
storage
```

Esto muestra cómo diferentes tipos de datos terminan utilizando distintas áreas de la EVM.

---

# 21. Storage Slots

El storage de un contrato se organiza en posiciones llamadas:

```text
storage slots
```

Cada slot tiene:

```text
32 bytes
```

equivalentes a:

```text
256 bits
```

Por ejemplo:

```solidity
contract Example {

    uint256 public a;
    uint256 public b;
    uint256 public c;

}
```

De manera simplificada:

```text
slot 0 → a

slot 1 → b

slot 2 → c
```

---

# 22. Ejemplo visual de storage

Contrato:

```solidity
contract StorageExample {

    uint256 public age = 25;
    uint256 public score = 100;

}
```

Podemos imaginar:

```text
Storage

slot 0
┌──────────────────────────────────┐
│                25                │
└──────────────────────────────────┘

slot 1
┌──────────────────────────────────┐
│               100                │
└──────────────────────────────────┘
```

---

# 23. Variables pequeñas pueden compartir slot

Supongamos:

```solidity
uint128 a;
uint128 b;
```

Cada uno ocupa:

```text
128 bits
```

Como un slot tiene:

```text
256 bits
```

ambos pueden compartir el mismo slot.

```text
slot 0

┌────────────────┬────────────────┐
│       b        │       a        │
│    128 bits    │    128 bits    │
└────────────────┴────────────────┘
```

Esto se conoce como:

```text
storage packing
```

y puede influir en el consumo de gas.

---

# 24. Orden de variables y gas

Considera:

```solidity
uint128 a;
uint256 b;
uint128 c;
```

Puede producir una distribución menos eficiente.

Mientras que:

```solidity
uint128 a;
uint128 c;
uint256 b;
```

puede permitir que:

```text
a + c
```

compartan un slot.

Por eso el orden de variables puede afectar el uso del storage.

Lo estudiaremos con mayor profundidad en:

```text
14-optimizacion-de-gas/
```

---

# 25. ¿Cómo funcionan mappings?

Un mapping:

```solidity
mapping(address => uint256) public balances;
```

no guarda cada valor simplemente en slots consecutivos.

Ethereum calcula posiciones utilizando hashing.

Conceptualmente:

```text
mapping
   ↓
key
+
slot del mapping
   ↓
hash
   ↓
storage location
```

De forma simplificada:

```text
keccak256(key, slot)
```

determina dónde se encuentra el valor.

Esto será importante más adelante para comprender:

* storage layout;
* proxies;
* assembly;
* debugging;
* seguridad.

---

# 26. ¿Cómo funcionan dynamic arrays?

Los arrays dinámicos también utilizan reglas especiales de almacenamiento.

Ejemplo:

```solidity
uint256[] public numbers;
```

El slot principal almacena información relacionada con:

```text
length
```

mientras que los elementos se almacenan a partir de una posición calculada mediante hashing.

Conceptualmente:

```text
slot
↓
length
```

y:

```text
keccak256(slot)
↓
primer elemento
```

---

# 27. Execution Context

Cuando la EVM ejecuta una llamada, crea un contexto de ejecución.

Este contexto incluye información como:

```text
msg.sender

msg.value

calldata

gas disponible

dirección del contrato

storage

memory
```

Por ejemplo:

```solidity
function whoAmI()
    public
    view
    returns (address)
{
    return msg.sender;
}
```

`msg.sender` forma parte del contexto actual de ejecución.

---

# 28. msg.sender

`msg.sender` representa la dirección que realizó la llamada inmediata.

Ejemplo:

```text
Alice
   ↓
Contract A
```

Dentro de `Contract A`:

```text
msg.sender = Alice
```

Pero si ocurre:

```text
Alice
   ↓
Contract A
   ↓
Contract B
```

dentro de `Contract B`:

```text
msg.sender = Contract A
```

No necesariamente:

```text
Alice
```

Este detalle será extremadamente importante para seguridad.

---

# 29. msg.value

Cuando una función recibe ETH:

```solidity
function deposit() external payable {
}
```

podemos consultar:

```solidity
msg.value
```

Si Alice envía:

```text
2 ETH
```

entonces dentro de la ejecución:

```text
msg.value = 2 ETH
```

---

# 30. msg.data

La llamada completa codificada está disponible mediante:

```solidity
msg.data
```

Incluye información relacionada con:

* la función llamada;
* los argumentos.

Conceptualmente:

```text
msg.data
│
├── function selector
│
└── encoded arguments
```

---

# 31. ¿Cómo sabe Ethereum qué función ejecutar?

Supongamos:

```solidity
function transfer(
    address to,
    uint256 amount
)
    external
{
}
```

Cuando llamamos esta función, el calldata comienza con un identificador llamado:

```text
function selector
```

Este selector ocupa:

```text
4 bytes
```

y se calcula a partir de la firma de la función.

Por ejemplo:

```text
transfer(address,uint256)
```

Se calcula:

```text
keccak256(
    "transfer(address,uint256)"
)
```

y se utilizan los primeros:

```text
4 bytes
```

---

# 32. Function Selector

Podemos imaginar una llamada así:

```text
calldata

┌──────────────┬──────────────────────┐
│   selector   │      argumentos      │
│   4 bytes    │                      │
└──────────────┴──────────────────────┘
```

El contrato examina:

```text
selector
```

y determina qué función debe ejecutar.

---

# 33. ABI

Para que aplicaciones externas puedan comunicarse correctamente con un contrato necesitamos saber:

* qué funciones existen;
* qué parámetros reciben;
* qué tipos utilizan;
* qué valores retornan.

Esta descripción se conoce como:

```text
ABI
```

que significa:

```text
Application Binary Interface
```

Por ejemplo:

```solidity
function transfer(
    address to,
    uint256 amount
)
    external
    returns (bool)
```

La ABI describe esta función en un formato que herramientas como:

```text
ethers.js
Hardhat
Frontend
Wallets
```

pueden entender.

---

# 34. Solidity → ABI + Bytecode

Cuando compilamos un contrato normalmente obtenemos, entre otras cosas:

```text
Solidity
   ↓
Compiler
   │
   ├── ABI
   │
   └── Bytecode
```

El:

```text
Bytecode
```

lo ejecuta la EVM.

La:

```text
ABI
```

permite que otras aplicaciones sepan cómo interactuar con el contrato.

---

# 35. Deployment Bytecode

Cuando desplegamos un contrato, existe código utilizado específicamente durante el proceso de creación.

Podemos llamarlo conceptualmente:

```text
creation bytecode
```

Ese código:

1. ejecuta el constructor;
2. configura el estado inicial;
3. devuelve el código que permanecerá en la blockchain.

---

# 36. Runtime Bytecode

Después del despliegue queda almacenado el código necesario para ejecutar el contrato.

A esto lo llamamos:

```text
runtime bytecode
```

Podemos visualizar:

```text
Creation Bytecode
      ↓
constructor
      ↓
deploy
      ↓
Runtime Bytecode
```

El runtime bytecode es el código que se ejecutará cuando alguien interactúe con el contrato.

---

# 37. Ejemplo con constructor

Contrato:

```solidity
contract Token {

    string public name;

    constructor(string memory _name) {
        name = _name;
    }

}
```

Durante el deploy:

```text
Creation Bytecode
      ↓
Ejecuta constructor
      ↓
name = _name
      ↓
Guarda Runtime Bytecode
```

Después del deployment:

```text
constructor
```

ya no puede ejecutarse otra vez.

---

# 38. La EVM tiene gas

Cada opcode tiene un determinado coste de gas.

Ejemplo conceptual:

```text
ADD
↓
consume gas
```

```text
SLOAD
↓
consume gas
```

```text
SSTORE
↓
consume bastante más gas
```

Por tanto:

```text
Código Solidity
      ↓
Opcodes
      ↓
Gas
```

Dos implementaciones Solidity que hacen algo parecido pueden terminar consumiendo diferente cantidad de gas.

---

# 39. ¿Por qué cada opcode cuesta gas?

Porque ejecutar instrucciones consume recursos.

La red necesita evitar programas infinitos.

Imaginemos:

```solidity
while (true) {

}
```

Si la ejecución fuera gratuita, podría continuar indefinidamente.

El gas impone un límite.

```text
Gas disponible
      ↓
Opcodes
      ↓
Gas disminuye
      ↓
0 gas
      ↓
STOP
```

Si una ejecución consume todo el gas disponible ocurre:

```text
Out of Gas
```

---

# 40. Out of Gas

Supongamos que una transacción tiene gas suficiente para ejecutar:

```text
100 operaciones
```

pero el contrato necesita:

```text
150 operaciones
```

La EVM llegará a un punto donde no tendrá suficiente gas.

Resultado:

```text
Out of Gas
```

Los cambios de estado de esa ejecución no se completarán.

---

# 41. Revert

Un smart contract puede detener una ejecución mediante:

```text
revert
```

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

la ejecución revierte.

```text
Estado anterior
      ↓
ejecución
      ↓
error
      ↓
revert
      ↓
estado anterior
```

Los cambios realizados durante esa ejecución se descartan.

---

# 42. Atomicidad

Las transacciones en Ethereum son atómicas.

Conceptualmente:

```text
todo
```

o:

```text
nada
```

Supongamos:

```text
Paso 1 → correcto

Paso 2 → correcto

Paso 3 → error
```

La ejecución no queda parcialmente aplicada.

Se revierte el estado de la transacción.

```text
Paso 1
Paso 2
Paso 3 ❌

↓

revert
```

---

# 43. CALL

Los contratos pueden llamar a otros contratos.

Ejemplo:

```text
Contract A
   ↓
CALL
   ↓
Contract B
```

Esto permite construir sistemas complejos donde múltiples contratos interactúan.

Ejemplo:

```text
DEX
│
├── Router
├── Pool
├── Token A
└── Token B
```

Todos pueden comunicarse mediante llamadas.

---

# 44. Cada llamada crea su propio contexto

Supongamos:

```text
Alice
   ↓
Contract A
   ↓
Contract B
```

Podemos tener:

```text
Contexto 1
Alice → Contract A
```

y luego:

```text
Contexto 2
Contract A → Contract B
```

Cada contexto tiene información como:

```text
msg.sender

msg.value

calldata

memory

gas
```

---

# 45. Call Stack

Cuando un contrato llama a otro contrato, la EVM mantiene una pila de llamadas.

Ejemplo:

```text
Alice
  ↓
A
  ↓
B
  ↓
C
```

Podemos imaginar:

```text
Call Stack

C
B
A
```

Cuando `C` termina:

```text
B
A
```

Cuando `B` termina:

```text
A
```

---

# 46. DELEGATECALL

Existe una instrucción especial llamada:

```text
DELEGATECALL
```

Su comportamiento es diferente a `CALL`.

En términos simplificados:

```text
CALL
↓
ejecuta código externo
↓
usando el storage del contrato llamado
```

Mientras:

```text
DELEGATECALL
↓
ejecuta código externo
↓
usando el storage del contrato original
```

Esta instrucción es fundamental para:

```text
Proxy Contracts
Upgradeable Contracts
Libraries
```

Pero también puede ser peligrosa si se utiliza incorrectamente.

Lo estudiaremos en Solidity avanzado y seguridad.

---

# 47. STATICCALL

Existe también:

```text
STATICCALL
```

que permite realizar llamadas donde no se permite modificar el estado.

Conceptualmente:

```text
Contract A
   ↓
STATICCALL
   ↓
Contract B
   ↓
solo lectura
```

---

# 48. CREATE

La EVM permite crear nuevos contratos mediante:

```text
CREATE
```

Conceptualmente:

```text
Contract A
   ↓
CREATE
   ↓
Contract B
```

Un contrato puede desplegar otro contrato.

---

# 49. CREATE2

Existe también:

```text
CREATE2
```

que permite calcular de manera determinista la dirección futura de un contrato utilizando ciertos datos.

Esto permite casos de uso avanzados como:

* factories;
* deterministic deployments;
* counterfactual addresses;
* sistemas de wallets;
* protocolos DeFi.

Lo veremos más adelante.

---

# 50. Dirección de un contrato

Cuando desplegamos un contrato, Ethereum genera una dirección.

Por ejemplo:

```text
0x1234...
```

Esa dirección permite localizar:

```text
runtime bytecode
```

y:

```text
storage
```

del contrato.

Podemos imaginar:

```text
Contract Address
│
├── Code
│
└── Storage
```

---

# 51. Code y Storage son diferentes

Un contrato tiene:

```text
code
```

y:

```text
storage
```

El código contiene las instrucciones.

El storage contiene los datos persistentes.

Ejemplo:

```solidity
contract Counter {

    uint256 public count;

    function increment() public {
        count++;
    }

}
```

Podemos imaginar:

```text
Contract
│
├── Code
│   └── increment()
│
└── Storage
    └── count
```

---

# 52. Ejecución paso a paso

Supongamos:

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

Alice ejecuta:

```text
increment()
```

Podemos simplificar el proceso:

```text
1. Alice firma una transacción

2. La transacción llega a Ethereum

3. La EVM carga el código del contrato

4. Lee el function selector

5. Encuentra increment()

6. Lee count del storage

7. count = 5

8. Suma 1

9. Resultado = 6

10. Guarda 6 en storage

11. Finaliza la ejecución
```

Resultado:

```text
count = 6
```

---

# 53. EVM desde el punto de vista del stack

Podríamos representar parte de esa ejecución así:

```text
SLOAD
↓
5
```

Stack:

```text
5
```

Luego:

```text
PUSH 1
```

Stack:

```text
1
5
```

Luego:

```text
ADD
```

Stack:

```text
6
```

Después:

```text
SSTORE
```

y el valor se guarda.

Esto es una simplificación, pero muestra la relación entre:

```text
Solidity
```

y:

```text
Opcodes
```

---

# 54. Eventos y Logs

Los smart contracts pueden emitir eventos.

Ejemplo:

```solidity
event Transfer(
    address indexed from,
    address indexed to,
    uint256 amount
);
```

Después:

```solidity
emit Transfer(
    msg.sender,
    to,
    amount
);
```

La EVM almacena estos eventos como:

```text
logs
```

Los logs pueden ser consultados por aplicaciones externas.

Ejemplo:

```text
Contract
   ↓
emit Event
   ↓
EVM Log
   ↓
Blockchain
   ↓
Frontend / Indexer
```

---

# 55. Los logs no son storage

Aunque un evento queda registrado en la blockchain, no funciona como una variable de storage.

Ejemplo:

```solidity
emit Transfer(...);
```

no significa que podamos hacer:

```solidity
Transfer.amount
```

desde otro contrato.

Los logs están diseñados principalmente para que aplicaciones externas puedan consultarlos.

---

# 56. RETURN

Una función puede devolver información.

Ejemplo:

```solidity
function getNumber()
    external
    pure
    returns (uint256)
{
    return 42;
}
```

La EVM utiliza mecanismos de retorno para devolver los datos codificados al caller.

```text
Contract
   ↓
RETURN
   ↓
Caller
```

---

# 57. REVERT también puede devolver datos

Cuando ocurre:

```solidity
revert("Error");
```

la EVM puede devolver información sobre el error.

Esto permite que herramientas como:

```text
Hardhat

ethers.js

wallets
```

puedan mostrar mensajes relacionados con el fallo.

---

# 58. Stack Too Deep

Tal vez en algún momento encuentres el error:

```text
Stack too deep
```

Este error está relacionado con cómo el compilador maneja valores y variables durante la ejecución.

Ejemplo conceptual:

```solidity
function example(
    uint a,
    uint b,
    uint c,
    uint d,
    uint e,
    uint f
) external {
    ...
}
```

Cuando una función tiene demasiados valores simultáneamente, el compilador puede tener dificultades para organizarlos dentro del modelo de la EVM.

En versiones modernas del compilador existen mejoras como:

```text
viaIR
```

que pueden cambiar cómo se genera el bytecode.

---

# 59. ¿Qué es el IR?

Un compilador normalmente no transforma directamente:

```text
Solidity
```

en:

```text
Bytecode
```

sin etapas intermedias.

Puede utilizar una representación intermedia:

```text
IR
```

o:

```text
Intermediate Representation
```

Conceptualmente:

```text
Solidity
   ↓
IR
   ↓
Optimización
   ↓
Bytecode
```

Esto permite realizar diferentes optimizaciones antes de generar el bytecode final.

---

# 60. Yul

Ethereum y Solidity también utilizan un lenguaje intermedio llamado:

```text
Yul
```

Yul permite trabajar a un nivel mucho más cercano a la EVM.

Ejemplo conceptual:

```yul
{
    let result := add(2, 3)
}
```

Yul aparecerá más adelante cuando estudiemos:

* assembly;
* optimización;
* internals;
* seguridad avanzada.

---

# 61. Assembly

Solidity permite escribir código más cercano a la EVM mediante:

```solidity
assembly {
}
```

Ejemplo:

```solidity
assembly {
    let result := add(2, 3)
}
```

Esto da mucho control, pero también elimina muchas protecciones que Solidity ofrece automáticamente.

Por eso debe utilizarse con cuidado.

---

# 62. Solidity abstrae la EVM

Cuando escribimos:

```solidity
uint256 result = a + b;
```

Solidity oculta muchos detalles.

Debajo puede ocurrir algo relacionado con:

```text
PUSH
PUSH
ADD
MSTORE
```

Por eso Solidity puede verse como una capa de abstracción sobre la EVM.

```text
Developer
   ↓
Solidity
   ↓
Compiler
   ↓
Opcodes
   ↓
EVM
```

---

# 63. Opcodes importantes

No necesitas memorizarlos ahora, pero conviene conocer algunos.

## Matemáticos

```text
ADD
SUB
MUL
DIV
MOD
```

## Stack

```text
PUSH
POP
DUP
SWAP
```

## Memory

```text
MLOAD
MSTORE
```

## Storage

```text
SLOAD
SSTORE
```

## Control de ejecución

```text
JUMP
JUMPI
STOP
RETURN
REVERT
```

## Contratos

```text
CALL
STATICCALL
DELEGATECALL
CREATE
CREATE2
```

## Información del contexto

```text
CALLER
CALLVALUE
CALLDATALOAD
ADDRESS
BALANCE
```

---

# 64. Solidity y Opcodes

Algunos conceptos Solidity tienen equivalentes de bajo nivel.

Por ejemplo:

```solidity
msg.sender
```

se relaciona con:

```text
CALLER
```

```solidity
msg.value
```

se relaciona con:

```text
CALLVALUE
```

```solidity
address(this)
```

se relaciona con:

```text
ADDRESS
```

```solidity
block.timestamp
```

se relaciona con información disponible dentro del contexto de ejecución.

---

# 65. La EVM no entiende nombres de variables

Supongamos:

```solidity
uint256 public totalBalance;
```

Para nosotros existe:

```text
totalBalance
```

Pero la EVM no piensa en nombres como:

```text
totalBalance
```

piensa en:

```text
storage slot
```

Por ejemplo:

```text
slot 0
```

Los nombres existen principalmente a nivel del código fuente y herramientas de desarrollo.

---

# 66. La EVM tampoco entiende clases tradicionales

Ethereum no ejecuta directamente conceptos como:

```text
Class
Object
Interface
Library
Struct
Mapping
```

de la misma forma en que los vemos en Solidity.

El compilador transforma estas abstracciones en:

```text
bytecode

storage layout

memory layout

function dispatching
```

que la EVM puede ejecutar.

---

# 67. ¿Qué ocurre al llamar una función view?

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

Desde una aplicación podemos hacer una llamada de lectura.

Conceptualmente:

```text
Frontend
   ↓
RPC
   ↓
Nodo
   ↓
EVM
   ↓
Ejecuta localmente
   ↓
Devuelve resultado
```

Como no estamos enviando una transacción on-chain:

```text
no modificamos el estado
```

---

# 68. Una función view también ejecuta EVM

Un error común es pensar que:

```text
view
```

significa que la EVM no ejecuta nada.

Sí ejecuta código.

La diferencia es que normalmente una consulta externa:

```text
no produce una transacción
```

y no cambia el estado persistente.

---

# 69. ¿Qué ocurre con pure?

Una función:

```solidity
pure
```

no necesita leer el estado del contrato.

Ejemplo:

```solidity
function add(
    uint256 a,
    uint256 b
)
    external
    pure
    returns (uint256)
{
    return a + b;
}
```

Trabaja únicamente con los datos proporcionados y valores temporales.

---

# 70. Tipos de ejecución

Podemos imaginar tres casos comunes:

```text
pure
↓
cálculo
```

```text
view
↓
lee estado
```

```text
non-view
↓
puede modificar estado
```

Por ejemplo:

```solidity
pure
```

```text
2 + 2
```

```solidity
view
```

```text
return balance;
```

```solidity
non-view
```

```text
balance = 100;
```

---

# 71. La EVM y los contratos inmutables

Cuando desplegamos un contrato tradicional:

```text
Runtime Bytecode
```

queda asociado a una dirección.

No podemos simplemente abrir el contrato y modificar:

```text
function foo()
```

como si fuera un servidor.

Por eso los smart contracts suelen considerarse:

```text
inmutables
```

Sin embargo, existen arquitecturas como:

```text
Proxy Patterns
```

que permiten construir sistemas actualizables.

---

# 72. ¿Cómo funcionan los proxies?

Conceptualmente:

```text
Usuario
   ↓
Proxy
   ↓
DELEGATECALL
   ↓
Implementation
```

El proxy mantiene:

```text
storage
```

mientras que la implementación contiene:

```text
logic
```

Gracias a `DELEGATECALL`, la lógica externa puede ejecutarse utilizando el storage del proxy.

Esta técnica es poderosa pero introduce riesgos importantes.

---

# 73. EVM y seguridad

Muchas vulnerabilidades de smart contracts se entienden mejor cuando conocemos la EVM.

Por ejemplo:

```text
Reentrancy
```

está relacionada con llamadas externas y flujo de ejecución.

```text
Storage collision
```

está relacionada con storage layout.

```text
Delegatecall vulnerabilities
```

están relacionadas con contextos de ejecución.

```text
Gas griefing
```

está relacionado con cómo se distribuye y consume gas.

---

# 74. EVM y optimización

Comprender la EVM también permite escribir contratos más eficientes.

Por ejemplo:

```text
Storage
↓
caro
```

```text
Memory
↓
más barato
```

```text
Calldata
↓
útil para parámetros externos
```

También podemos optimizar:

* número de escrituras en storage;
* organización de variables;
* loops;
* tipos de datos;
* uso de calldata;
* errores personalizados;
* estructuras.

---

# 75. Ejemplo de optimización conceptual

Código A:

```solidity
function example() external {

    total = total + 1;

    total = total + 1;

    total = total + 1;

}
```

Esto puede implicar múltiples accesos a storage.

Podríamos hacer:

```solidity
function example() external {

    uint256 current = total;

    current++;
    current++;
    current++;

    total = current;

}
```

Conceptualmente:

```text
leer storage una vez
↓
trabajar temporalmente
↓
escribir storage una vez
```

En determinadas situaciones esto puede reducir operaciones costosas.

---

# 76. EVM y Hardhat

Hardhat nos permitirá observar y trabajar con muchos de estos conceptos.

Por ejemplo:

```text
Solidity
   ↓
Hardhat compile
   ↓
Artifacts
   │
   ├── ABI
   └── Bytecode
```

Hardhat también nos ayudará a:

* ejecutar contratos localmente;
* inspeccionar errores;
* probar llamadas;
* desplegar contratos;
* medir gas;
* depurar transacciones.

---

# 77. EVM local

Cuando ejecutemos una red local con Hardhat tendremos una implementación que reproduce el comportamiento necesario para desarrollar contra Ethereum.

Podremos hacer:

```text
Hardhat
   ↓
Local Ethereum Environment
   ↓
EVM execution
```

Esto permite probar nuestros contratos sin utilizar Mainnet.

---

# 78. Ejemplo completo

Imaginemos:

```solidity
contract Bank {

    mapping(address => uint256)
        public balances;

    function deposit()
        external
        payable
    {
        balances[msg.sender] += msg.value;
    }

}
```

Alice envía:

```text
1 ETH
```

a:

```text
deposit()
```

Dentro de la EVM ocurre conceptualmente:

```text
1. Se recibe calldata

2. Se identifica deposit()

3. msg.sender = Alice

4. msg.value = 1 ETH

5. Se calcula la posición del mapping

6. Se lee balances[Alice]

7. Se suma 1 ETH

8. Se guarda el nuevo balance

9. Se completa la ejecución
```

Podemos visualizar:

```text
Alice
   ↓
Transaction
   ↓
Calldata
   ↓
EVM
   ↓
Function Selector
   ↓
deposit()
   ↓
Mapping Storage Slot
   ↓
SLOAD
   ↓
ADD
   ↓
SSTORE
   ↓
Nuevo Estado
```

Este flujo conecta prácticamente todos los conceptos fundamentales de la EVM.

---

# 79. Modelo mental completo

Cuando escribimos:

```solidity
balances[msg.sender] += msg.value;
```

nosotros vemos una sola línea.

Pero internamente intervienen conceptos como:

```text
msg.sender
      ↓
CALLER

msg.value
      ↓
CALLVALUE

balances
      ↓
Storage

mapping lookup
      ↓
keccak256

read
      ↓
SLOAD

addition
      ↓
ADD

write
      ↓
SSTORE
```

El trabajo del compilador es transformar nuestra abstracción de alto nivel en operaciones que la EVM pueda ejecutar.

---

# 80. ¿Necesitamos aprender todos los opcodes?

No.

Para comenzar a programar smart contracts no necesitamos memorizar todos los opcodes.

Podemos avanzar perfectamente con:

```text
Solidity
+
Hardhat
+
Testing
```

Sin embargo, conocer la EVM se vuelve muy útil cuando entramos en:

```text
Solidity avanzado

Seguridad

Auditoría

Optimización de gas

Assembly

Proxies

DeFi
```

---

# 81. Qué debes recordar

Después de este archivo deberías recordar:

### EVM

Es la máquina virtual que ejecuta smart contracts.

### Solidity

Es un lenguaje de alto nivel que se compila para la EVM.

### Bytecode

Es el código que ejecuta la EVM.

### Opcode

Es una instrucción individual de la EVM.

### Stack

Área utilizada para operaciones durante la ejecución.

### Memory

Almacenamiento temporal durante una llamada.

### Storage

Almacenamiento persistente del contrato.

### Calldata

Datos de entrada de una llamada externa.

### ABI

Descripción utilizada para interactuar con contratos.

### Function Selector

Identificador de 4 bytes utilizado para identificar qué función debe ejecutarse.

### Gas

Mide el coste de ejecutar operaciones.

### CALL

Permite llamar a otro contrato.

### DELEGATECALL

Permite ejecutar código externo utilizando el contexto de storage del contrato actual.

---

# 82. Mapa mental de la EVM

```text
                        EVM
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     Bytecode          Datos          Execution
        │                │                │
     Opcodes       ┌─────┼─────┐     Call Context
                   │     │     │
                 Stack Memory Storage
                         │
                      Calldata
```

Otra representación:

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
   │
   ├── Stack
   ├── Memory
   ├── Storage
   └── Calldata
   ↓
Execution
   ↓
New State
```

---

# 83. Flujo completo de una transacción

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
Contract Address
   ↓
Runtime Bytecode
   ↓
EVM
   ↓
Calldata
   ↓
Function Selector
   ↓
Opcodes
   ↓
Stack / Memory / Storage
   ↓
Gas
   ↓
Resultado
   ↓
Nuevo estado
```

Si comprendes este flujo, ya tienes una base muy sólida para entender qué ocurre realmente debajo de Solidity.

---

# 84. Preguntas de repaso

Intenta responder:

1. ¿Qué significa EVM?
2. ¿Ethereum ejecuta directamente Solidity?
3. ¿Qué es el bytecode?
4. ¿Qué es un opcode?
5. ¿Por qué la EVM debe ser determinista?
6. ¿Qué es el stack?
7. ¿Qué diferencia existe entre `memory` y `storage`?
8. ¿Qué es `calldata`?
9. ¿Qué es un storage slot?
10. ¿Cuánto mide un storage slot?
11. ¿Qué es un function selector?
12. ¿Cuántos bytes ocupa un function selector?
13. ¿Qué es la ABI?
14. ¿Qué diferencia hay entre creation bytecode y runtime bytecode?
15. ¿Qué ocurre si una ejecución se queda sin gas?
16. ¿Qué significa revert?
17. ¿Qué es `CALL`?
18. ¿Qué diferencia conceptual existe entre `CALL` y `DELEGATECALL`?
19. ¿Por qué `SSTORE` es relevante para el consumo de gas?
20. ¿Por qué comprender la EVM ayuda a auditar contratos?

---

# 85. No necesitas dominar todavía

Todavía no necesitas saber en profundidad:

```text
EVM bytecode decoding

ABI encoding manual

Memory expansion

Storage hashing exacto

Transient storage

Gas stipend

Call depth

Return data internals

Yul

Inline Assembly

Free Memory Pointer

Memory layout

Proxy storage slots

Diamond storage

EIP internals
```

Estos conceptos tendrán mucho más sentido después de aprender Solidity.

Por ahora lo importante es comprender:

```text
Solidity
   ↓
Compiler
   ↓
Bytecode
   ↓
EVM
   ↓
Opcodes
   ↓
Stack / Memory / Storage
   ↓
Nuevo Estado
```

---

# 86. Siguiente paso

Ahora entendemos qué máquina ejecuta nuestros contratos.

Pero todavía falta una pieza fundamental:

```text
¿Quién controla una cuenta?
```

y:

```text
¿Cómo puede un usuario firmar una transacción?
```

Para responderlo continuaremos con:

```text
wallets.md
```

donde veremos:

* qué es una wallet;
* qué es una clave privada;
* qué es una clave pública;
* cómo se genera una dirección;
* qué significa firmar;
* qué es una seed phrase;
* diferencias entre wallet y cuenta;
* MetaMask;
* wallets de software;
* hardware wallets;
* seguridad de claves privadas.

---

# Resumen

La EVM es la máquina virtual que ejecuta el código de los smart contracts de Ethereum.

Nosotros escribimos:

```solidity
balances[msg.sender] += msg.value;
```

pero la EVM termina trabajando con conceptos mucho más bajos:

```text
Bytecode

Opcodes

Stack

Memory

Storage

Calldata

Gas
```

La relación fundamental es:

```text
Solidity
   ↓
Compiler
   ↓
Bytecode
   ↓
EVM
   ↓
Execution
```

y durante una ejecución:

```text
Calldata
   ↓
Function Selector
   ↓
Opcodes
   ↓
Stack
   ↓
Memory
   ↓
Storage
   ↓
Nuevo Estado
```

A medida que avancemos hacia Solidity avanzado, seguridad, auditoría y optimización de gas, volveremos constantemente a estos conceptos.
