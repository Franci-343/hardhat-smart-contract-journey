# Gas en Ethereum

Cada operación que ejecutamos en Ethereum consume recursos computacionales.

Leer datos, escribir en `storage`, ejecutar una suma, llamar a otro contrato o desplegar un smart contract requiere trabajo por parte de la red.

Ethereum utiliza un mecanismo llamado:

```text
Gas
```

para medir ese trabajo.

Podemos pensar en el gas como una unidad que representa:

```text
cuánto trabajo computacional necesita una operación
```

Por ejemplo:

```text
Operación simple
↓
poco gas
```

```text
Operación compleja
↓
más gas
```

El gas es uno de los conceptos más importantes de Ethereum porque conecta directamente:

```text
Código Solidity
      ↓
Opcodes
      ↓
Ejecución EVM
      ↓
Gas consumido
      ↓
Comisión pagada
```

---

# 1. ¿Qué es el gas?

El gas es una unidad utilizada por Ethereum para medir el coste computacional de ejecutar operaciones.

Por ejemplo, la EVM puede ejecutar instrucciones como:

```text
ADD
SLOAD
SSTORE
CALL
```

Cada una tiene un determinado coste de gas.

Conceptualmente:

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
consume gas
```

El usuario paga por el gas consumido durante una transacción.

---

# 2. ¿Por qué existe el gas?

Imaginemos que ejecutar código en Ethereum fuera completamente gratis.

Alguien podría desplegar:

```solidity
while (true) {
    // ejecutar para siempre
}
```

La red tendría que intentar ejecutar ese código indefinidamente.

Esto sería un problema enorme.

El gas introduce un límite económico y computacional.

```text
Transacción
      ↓
Tiene una cantidad limitada de gas
      ↓
Cada operación consume gas
      ↓
Si el gas se termina
      ↓
La ejecución se detiene
```

Por tanto, el gas ayuda a proteger Ethereum contra:

* loops infinitos;
* ejecución ilimitada;
* abuso de recursos;
* spam computacional.

---

# 3. Gas no es ETH

Uno de los errores más comunes de los principiantes es pensar:

```text
Gas = ETH
```

No es correcto.

El gas es:

```text
una unidad de trabajo computacional
```

ETH es:

```text
el activo utilizado para pagar ese trabajo
```

Podemos visualizarlo así:

```text
Gas
↓
cantidad de trabajo
```

```text
ETH
↓
activo utilizado para pagar
```

---

# 4. Una analogía sencilla

Podemos comparar Ethereum con un automóvil.

```text
Distancia recorrida
↓
Gas utilizado
```

y:

```text
Precio del combustible
↓
Precio por unidad de gas
```

En Ethereum ocurre algo parecido:

```text
Trabajo computacional
↓
Gas Used
```

```text
Precio de ejecutar gas
↓
Precio del gas
```

Entonces:

```text
Gas utilizado
×
Precio por gas
=
Comisión
```

---

# 5. Gas Used

`Gas Used` representa cuánto gas consumió realmente una transacción.

Supongamos que una operación consume:

```text
21,000 gas
```

Entonces:

```text
gas used = 21,000
```

Si una operación más compleja consume:

```text
150,000 gas
```

entonces:

```text
gas used = 150,000
```

Cuanto más trabajo tenga que hacer la EVM, normalmente mayor será el gas utilizado.

---

# 6. Gas Limit

Cuando enviamos una transacción debemos permitir una cantidad máxima de gas para su ejecución.

Esto se conoce como:

```text
gas limit
```

Supongamos:

```text
gas limit = 100,000
```

Esto significa:

> Esta transacción puede consumir como máximo 100,000 unidades de gas.

No significa necesariamente que gastará las 100,000.

Si finalmente utiliza:

```text
65,000
```

solo se cobra aproximadamente por el gas realmente consumido.

---

# 7. Gas Limit vs Gas Used

Debemos distinguir:

```text
Gas Limit
```

de:

```text
Gas Used
```

Ejemplo:

```text
Gas Limit = 100,000
Gas Used  = 63,421
```

La transacción tenía autorización para utilizar hasta:

```text
100,000
```

pero solo necesitó:

```text
63,421
```

El gas restante no se cobra como si hubiera sido utilizado.

---

# 8. ¿Qué pasa si el gas limit es demasiado bajo?

Supongamos:

```text
gas limit = 50,000
```

pero el contrato necesita:

```text
70,000
```

La EVM llegará a un punto donde ya no podrá continuar.

Resultado:

```text
Out of Gas
```

La ejecución falla.

---

# 9. Out of Gas

Cuando una transacción se queda sin gas:

```text
Transacción
      ↓
Ejecución
      ↓
Consume gas
      ↓
Gas disponible = 0
      ↓
Out of Gas
```

los cambios de estado de esa ejecución no se completan.

Por ejemplo:

```text
balance = 100
```

Una función intenta:

```text
balance = 200
```

pero se queda sin gas antes de terminar.

Resultado:

```text
balance = 100
```

El estado vuelve al estado anterior de esa ejecución.

---

# 10. ¿Pierdo ETH si una transacción falla?

Aunque la transacción falle, normalmente el trabajo que la red ya realizó debe pagarse.

Por ejemplo:

```text
Transacción
↓
EVM ejecuta instrucciones
↓
consume recursos
↓
revert
```

Aunque el cambio final no se aplique, la ejecución ya consumió recursos computacionales.

Por eso una transacción fallida puede seguir costando ETH.

---

# 11. ¿Por qué se paga una transacción fallida?

Porque los nodos tuvieron que ejecutar la transacción para descubrir que fallaba.

Por ejemplo:

```text
Paso 1
↓
consume gas

Paso 2
↓
consume gas

Paso 3
↓
consume gas

Paso 4
↓
revert
```

Los primeros pasos ya utilizaron recursos.

Por tanto:

```text
revert ≠ ejecución gratuita
```

---

# 12. Transferir ETH también consume gas

Incluso una transferencia básica de ETH consume gas.

Ejemplo:

```text
Alice
↓
1 ETH
↓
Bob
```

La operación requiere que Ethereum procese una transacción.

Por eso existe una comisión.

Una transferencia simple entre cuentas externas tradicionalmente utiliza como referencia:

```text
21,000 gas
```

aunque transacciones más complejas pueden consumir mucho más.

---

# 13. Ejecutar smart contracts consume gas

Supongamos:

```solidity
function increment() external {
    count++;
}
```

Para ejecutar esta función la EVM debe realizar varias operaciones.

Conceptualmente:

```text
leer count
↓
sumar 1
↓
escribir count
```

Estas operaciones consumen gas.

Por eso:

```text
interactuar con un smart contract
```

puede costar más que una transferencia simple.

---

# 14. Cada opcode tiene un coste

La EVM ejecuta instrucciones llamadas:

```text
opcodes
```

Cada opcode tiene asociado un determinado coste de gas según las reglas del protocolo.

Ejemplo conceptual:

```text
ADD
↓
barato
```

```text
SLOAD
↓
más costoso
```

```text
SSTORE
↓
puede ser mucho más costoso
```

Esto explica por qué dos funciones Solidity diferentes pueden tener costos de gas diferentes.

---

# 15. Ejemplo

Contrato:

```solidity
contract Counter {

    uint256 public count;

    function increment() external {
        count++;
    }

}
```

La operación:

```solidity
count++;
```

puede involucrar conceptos como:

```text
SLOAD
↓
leer storage
```

```text
ADD
↓
sumar
```

```text
SSTORE
↓
escribir storage
```

El coste total de la transacción depende de todas las operaciones que termine ejecutando la EVM.

---

# 16. Storage es caro

Modificar el almacenamiento persistente es una de las operaciones importantes al analizar gas.

Ejemplo:

```solidity
uint256 public number;

function setNumber(uint256 value) external {
    number = value;
}
```

La operación:

```solidity
number = value;
```

modifica:

```text
storage
```

y requiere trabajo persistente para la red.

Por eso almacenar datos on-chain tiene un coste.

---

# 17. Memory suele ser más barata que Storage

Recordemos:

```text
Storage
↓
persistente
```

```text
Memory
↓
temporal
```

Los datos almacenados en `memory` desaparecen después de terminar la llamada.

Por esta razón, trabajar con memoria temporal suele ser considerablemente más barato que realizar escrituras persistentes en `storage`.

---

# 18. Calldata

Cuando una función externa recibe parámetros:

```solidity
function transfer(
    address to,
    uint256 amount
) external {
}
```

estos datos llegan codificados dentro del:

```text
calldata
```

Transmitir datos también tiene coste.

Esto significa que:

```text
más datos
↓
más recursos
↓
puede significar más gas
```

---

# 19. El precio del gas

Saber cuánto gas consume una transacción no es suficiente para calcular cuánto ETH pagaremos.

También necesitamos saber cuánto cuesta cada unidad de gas.

Conceptualmente:

```text
Gas Used
×
Precio por unidad de gas
=
Transaction Fee
```

Ejemplo simplificado:

```text
21,000 gas
×
20 gwei
```

produce una comisión expresada en ETH.

---

# 20. ¿Qué es Gwei?

Los precios de gas normalmente se expresan en:

```text
gwei
```

Un gwei es una fracción de ETH.

La relación es:

```text
1 ETH
=
1,000,000,000 gwei
```

Es decir:

```text
1 gwei
=
0.000000001 ETH
```

También:

```text
1 ETH
=
10^9 gwei
```

---

# 21. Wei

La unidad más pequeña de ETH se llama:

```text
wei
```

La relación es:

```text
1 ETH
=
1,000,000,000,000,000,000 wei
```

o:

```text
1 ETH
=
10^18 wei
```

---

# 22. Relación entre Wei, Gwei y ETH

Podemos visualizar:

```text
1 ETH
=
10^9 gwei
=
10^18 wei
```

Entonces:

```text
1 gwei
=
10^9 wei
```

---

# 23. Ejemplo de conversión

Supongamos:

```text
20 gwei
```

Sabemos:

```text
1 gwei = 10^9 wei
```

Entonces:

```text
20 gwei
=
20,000,000,000 wei
```

---

# 24. Fórmula básica de una comisión

En su forma conceptual más sencilla:

```text
Transaction Fee
=
Gas Used
×
Gas Price
```

Ejemplo:

```text
Gas Used = 21,000

Gas Price = 20 gwei
```

Entonces:

```text
21,000 × 20 gwei
=
420,000 gwei
```

Convertimos a ETH:

```text
0.00042 ETH
```

---

# 25. Ejemplo completo

Alice envía ETH a Bob.

La transacción consume:

```text
21,000 gas
```

y el precio efectivo es:

```text
15 gwei
```

Entonces:

```text
21,000 × 15
=
315,000 gwei
```

En ETH:

```text
0.000315 ETH
```

Esa sería la comisión aproximada para ese ejemplo.

---

# 26. ¿El precio del gas siempre es igual?

No.

El precio que los usuarios están dispuestos a pagar cambia dependiendo de las condiciones de la red.

Cuando existe mucha demanda:

```text
muchos usuarios
↓
muchas transacciones
↓
competencia por espacio en bloques
↓
comisiones pueden aumentar
```

Cuando existe menor demanda:

```text
menos competencia
↓
comisiones pueden disminuir
```

---

# 27. Los bloques tienen capacidad limitada

Ethereum no puede incluir una cantidad infinita de trabajo dentro de cada bloque.

Existe un límite relacionado con cuánto gas puede contener un bloque.

Conceptualmente:

```text
Block
│
├── Tx 1 → gas
├── Tx 2 → gas
├── Tx 3 → gas
├── Tx 4 → gas
└── ...
```

La suma del trabajo está limitada.

Por eso el espacio dentro de los bloques tiene valor.

---

# 28. Demanda de espacio

Podemos pensar en un bloque como un espacio limitado.

```text
Usuarios
   ↓
Transacciones
   ↓
Compiten por entrar
   ↓
Bloque
```

Si muchas personas quieren enviar transacciones al mismo tiempo, la demanda aumenta.

Esto puede afectar las tarifas.

---

# 29. EIP-1559

Ethereum utiliza un sistema de tarifas introducido por:

```text
EIP-1559
```

Este sistema separa el precio de una transacción en componentes importantes:

```text
Base Fee
```

y:

```text
Priority Fee
```

Además, el usuario puede indicar un:

```text
Max Fee Per Gas
```

---

# 30. Base Fee

La:

```text
base fee
```

es una tarifa base determinada por el protocolo.

Cambia automáticamente dependiendo del uso de los bloques.

Conceptualmente:

```text
bloques muy utilizados
↓
base fee puede subir
```

```text
bloques menos utilizados
↓
base fee puede bajar
```

---

# 31. ¿Quién recibe la Base Fee?

La base fee no se entrega directamente al validador.

Se:

```text
burn
```

es decir:

```text
se quema
```

El ETH correspondiente a esa parte de la comisión es retirado del suministro.

Conceptualmente:

```text
Transaction Fee
│
├── Base Fee
│     ↓
│   Burn
│
└── Priority Fee
      ↓
   Validator
```

---

# 32. Priority Fee

La:

```text
priority fee
```

también puede llamarse:

```text
tip
```

o propina.

Representa una cantidad adicional que puede incentivar la inclusión de la transacción.

Conceptualmente:

```text
Usuario
↓
Priority Fee
↓
Validador
```

---

# 33. Max Priority Fee Per Gas

En una transacción moderna podemos indicar:

```text
maxPriorityFeePerGas
```

Esto representa el máximo que estamos dispuestos a pagar como prioridad por unidad de gas.

Por ejemplo:

```text
maxPriorityFeePerGas = 2 gwei
```

---

# 34. Max Fee Per Gas

También podemos indicar:

```text
maxFeePerGas
```

Representa el máximo total por unidad de gas que estamos dispuestos a pagar.

Por ejemplo:

```text
maxFeePerGas = 50 gwei
```

Esto no significa necesariamente que pagaremos exactamente 50 gwei.

Es un límite máximo.

---

# 35. Effective Gas Price

El precio real utilizado finalmente puede llamarse:

```text
effective gas price
```

De manera simplificada, está relacionado con:

```text
base fee
+
priority fee
```

respetando el máximo establecido por:

```text
maxFeePerGas
```

---

# 36. Ejemplo EIP-1559

Supongamos:

```text
Base Fee = 20 gwei

Priority Fee = 2 gwei

Max Fee = 40 gwei
```

El precio efectivo podría ser:

```text
22 gwei
```

Entonces:

```text
Gas Used
×
22 gwei
=
Transaction Fee
```

---

# 37. Max Fee no significa precio final

Supongamos:

```text
maxFeePerGas = 100 gwei
```

pero la transacción termina necesitando un precio efectivo de:

```text
24 gwei
```

No significa que automáticamente se cobre:

```text
100 gwei
```

por unidad.

`maxFeePerGas` funciona como un límite máximo que estamos dispuestos a aceptar.

---

# 38. Fórmula conceptual moderna

Una forma útil de pensar en una transacción EIP-1559 es:

```text
Fee
=
Gas Used
×
Effective Gas Price
```

y:

```text
Effective Gas Price
≈
Base Fee
+
Priority Fee
```

siempre limitado por las condiciones configuradas en la transacción.

---

# 39. Ejemplo completo EIP-1559

Supongamos:

```text
Gas Used = 50,000

Base Fee = 18 gwei

Priority Fee = 2 gwei
```

Entonces:

```text
Effective Gas Price
=
20 gwei
```

La comisión sería:

```text
50,000 × 20 gwei
=
1,000,000 gwei
```

En ETH:

```text
0.001 ETH
```

---

# 40. ¿Qué parte se quema?

Con el ejemplo anterior:

```text
Base Fee = 18 gwei
Priority Fee = 2 gwei
Gas Used = 50,000
```

La parte correspondiente a base fee sería:

```text
50,000 × 18 gwei
```

y se quema.

La parte correspondiente a priority fee sería:

```text
50,000 × 2 gwei
```

y forma parte de la compensación relacionada con la inclusión de la transacción.

---

# 41. Gas Estimation

Antes de enviar una transacción, una wallet o librería suele intentar estimar cuánto gas necesitará.

Esto se conoce como:

```text
gas estimation
```

Conceptualmente:

```text
Transacción propuesta
      ↓
simulación
      ↓
estimación de ejecución
      ↓
gas estimado
```

Herramientas como:

```text
wallets

ethers.js

Hardhat
```

pueden realizar estas estimaciones automáticamente.

---

# 42. Una estimación no siempre es perfecta

El gas necesario puede depender del estado actual del contrato.

Por ejemplo:

```solidity
if (balance > 100) {
    ejecutarOperacionCara();
}
```

Si el estado cambia antes de que nuestra transacción sea ejecutada, el camino de ejecución también podría cambiar.

Por tanto:

```text
estimación
≠
garantía absoluta
```

---

# 43. El estado afecta al gas

El coste de una función no depende únicamente del código.

También puede depender del estado actual.

Ejemplo:

```solidity
mapping(address => uint256) balances;
```

Modificar un valor puede tener costes distintos dependiendo de su situación previa.

Conceptualmente:

```text
0 → valor distinto de 0
```

puede comportarse diferente a:

```text
valor → otro valor
```

a nivel de costes de almacenamiento.

---

# 44. Loops y gas

Los loops pueden ser peligrosos en smart contracts.

Ejemplo:

```solidity
for (uint256 i = 0; i < users.length; i++) {
    balances[users[i]] += 1;
}
```

Si:

```text
users.length = 10
```

puede ser manejable.

Pero si:

```text
users.length = 1,000,000
```

la función puede necesitar una enorme cantidad de gas.

---

# 45. Loops sin límite

Un patrón peligroso es depender de arrays cuyo tamaño puede crecer indefinidamente.

Ejemplo:

```solidity
address[] public users;

function payEveryone() external {

    for (uint256 i = 0; i < users.length; i++) {
        // operación
    }

}
```

Si `users` crece demasiado, puede llegar un punto donde ejecutar toda la función dentro de una sola transacción no sea práctico.

---

# 46. Gas y diseño de contratos

Por eso diseñar smart contracts no consiste únicamente en escribir código correcto.

También debemos pensar:

```text
¿Puede ejecutarse con gas razonable?
```

```text
¿Puede crecer el número de iteraciones?
```

```text
¿Cuántas escrituras en storage realizamos?
```

```text
¿Estamos guardando datos innecesarios?
```

Estas preguntas son fundamentales en Solidity.

---

# 47. Leer Storage

Leer una variable persistente:

```solidity
uint256 value = total;
```

requiere acceder al almacenamiento del contrato.

Conceptualmente:

```text
Storage
↓
SLOAD
↓
value
```

Esto consume gas durante una transacción.

---

# 48. Escribir Storage

Modificar:

```solidity
total = 100;
```

requiere una operación relacionada con:

```text
SSTORE
```

Las escrituras persistentes suelen ser mucho más relevantes para el coste que cálculos simples.

Por eso una regla mental útil es:

```text
Storage writes
=
caros
```

---

# 49. Ejemplo de código poco eficiente

```solidity
function incrementThreeTimes() external {

    total = total + 1;

    total = total + 1;

    total = total + 1;

}
```

Estamos trabajando repetidamente con storage.

---

# 50. Ejemplo conceptual más eficiente

Podemos almacenar temporalmente:

```solidity
function incrementThreeTimes() external {

    uint256 current = total;

    current++;
    current++;
    current++;

    total = current;

}
```

Conceptualmente:

```text
leer storage
↓
trabajar temporalmente
↓
escribir storage
```

Esto puede evitar accesos persistentes innecesarios.

---

# 51. Pero no optimices prematuramente

Aunque entender gas es importante, tampoco debemos sacrificar:

* claridad;
* seguridad;
* mantenibilidad;
* corrección;

por ahorrar cantidades insignificantes.

Primero:

```text
correcto
```

después:

```text
seguro
```

y luego:

```text
optimizado
```

---

# 52. Gas y tipos de variables

Supongamos:

```solidity
uint256 a;
```

y:

```solidity
uint8 a;
```

Un principiante podría pensar:

```text
uint8 siempre consume menos gas
```

Pero no necesariamente.

La EVM trabaja naturalmente con palabras de:

```text
256 bits
```

Por tanto, tipos pequeños no siempre reducen costes de cálculo.

Su utilidad para gas aparece especialmente cuando podemos realizar:

```text
storage packing
```

---

# 53. Storage Packing

Ejemplo:

```solidity
uint128 a;
uint128 b;
```

Ambos pueden caber dentro de un mismo slot de:

```text
256 bits
```

Conceptualmente:

```text
slot 0

┌──────────────┬──────────────┐
│      b       │      a       │
│   128 bits   │   128 bits   │
└──────────────┴──────────────┘
```

Esto puede reducir el número de slots utilizados.

---

# 54. Orden de variables

Compara:

```solidity
uint128 a;
uint256 b;
uint128 c;
```

con:

```solidity
uint128 a;
uint128 c;
uint256 b;
```

En el segundo caso:

```text
a + c
```

pueden compartir un slot.

Este tipo de decisiones puede importar para el consumo de storage.

---

# 55. Calldata vs Memory

En funciones externas, utilizar:

```solidity
calldata
```

para parámetros que solo necesitamos leer puede evitar copias innecesarias.

Ejemplo:

```solidity
function sum(
    uint256[] calldata numbers
) external pure returns (uint256) {
}
```

En lugar de copiar inmediatamente todo el array a `memory`.

---

# 56. `constant`

Si un valor nunca cambia y conocemos su valor durante compilación:

```solidity
uint256 public constant MAX_SUPPLY = 1000;
```

el compilador puede tratarlo de manera distinta a una variable almacenada normalmente en storage.

Esto puede ahorrar almacenamiento y gas en determinadas situaciones.

---

# 57. `immutable`

También existe:

```solidity
immutable
```

Ejemplo:

```solidity
address public immutable owner;

constructor() {
    owner = msg.sender;
}
```

El valor se establece durante la construcción y luego no puede modificarse normalmente.

Puede ser más eficiente que mantener ciertos valores como variables normales de storage.

---

# 58. Custom Errors

Podemos crear errores personalizados.

Ejemplo:

```solidity
error NotOwner();
```

y:

```solidity
if (msg.sender != owner) {
    revert NotOwner();
}
```

En ciertos casos pueden ser más eficientes que almacenar largos strings de error.

---

# 59. Comparación conceptual

En lugar de:

```solidity
require(
    msg.sender == owner,
    "Only the owner can execute this function"
);
```

podemos utilizar:

```solidity
error NotOwner();

if (msg.sender != owner) {
    revert NotOwner();
}
```

Este tipo de optimizaciones será estudiado más adelante.

---

# 60. Eventos vs Storage

Supongamos que queremos registrar:

```text
Alice depositó 10 ETH
```

Podríamos pensar en guardar toda esa información en storage.

Pero si el dato solo necesita ser consumido off-chain, en algunos diseños puede ser mejor emitir un evento.

Ejemplo:

```solidity
event Deposit(
    address indexed user,
    uint256 amount
);
```

```solidity
emit Deposit(msg.sender, msg.value);
```

Los logs tienen características distintas y pueden ser más adecuados para ciertos datos históricos.

---

# 61. No uses eventos como reemplazo ciego de Storage

Aunque los eventos puedan ser más baratos que algunas escrituras en storage:

```text
Event
≠
Storage
```

Un contrato no puede consultar eventos históricos como si fueran variables de estado normales.

Por tanto la decisión depende del caso de uso.

---

# 62. Deploy de contratos consume gas

Desplegar un contrato también es una transacción.

```text
Solidity
↓
Compile
↓
Creation Bytecode
↓
Deployment Transaction
↓
EVM
↓
Contract
```

Cuanto más grande y complejo sea el contrato, mayor puede ser el coste de despliegue.

---

# 63. Bytecode y deployment cost

Cuando desplegamos un smart contract se publica código en Ethereum.

Por tanto:

```text
más bytecode
↓
más datos
↓
más coste de deployment
```

Esto hace que el tamaño del contrato sea relevante.

---

# 64. Contract Size

Ethereum impone límites sobre el tamaño del código desplegado de un contrato.

Esto evita contratos individuales gigantescos y limita ciertos abusos.

Cuando nuestros contratos se vuelven muy grandes podemos necesitar:

* dividir lógica;
* utilizar librerías;
* optimizar;
* reconsiderar arquitectura.

---

# 65. Gas y llamadas externas

Un contrato puede llamar otro contrato.

```text
Contract A
↓
CALL
↓
Contract B
```

Esto añade ejecución adicional.

Por tanto puede aumentar el gas consumido.

---

# 66. Llamadas anidadas

Supongamos:

```text
A
↓
B
↓
C
↓
D
```

Cada contrato ejecuta instrucciones.

El coste total puede acumularse.

```text
Gas A
+
Gas B
+
Gas C
+
Gas D
```

forma parte del coste de la transacción.

---

# 67. Gas disponible durante llamadas

Cuando un contrato llama a otro, parte del gas disponible continúa siendo utilizado dentro de la nueva llamada.

Por ejemplo:

```text
Transaction
↓
Contract A
↓
Contract B
```

`Contract B` necesita gas para ejecutar su código.

Esto puede tener implicaciones importantes de seguridad y diseño.

---

# 68. Gas y Reentrancy

El gas también aparece en discusiones de seguridad como:

```text
reentrancy
```

Históricamente algunos patrones intentaron depender de cantidades específicas de gas enviadas durante transferencias.

No debemos diseñar seguridad confiando ingenuamente en supuestos rígidos sobre costes de gas.

Las reglas del protocolo pueden evolucionar.

Estudiaremos esto en:

```text
07-seguridad/
```

---

# 69. Gas Refunds

Algunas operaciones de la EVM pueden generar mecanismos relacionados con:

```text
gas refunds
```

Por ejemplo, determinados cambios en storage históricamente han permitido recuperar una parte del coste.

Sin embargo, las reglas de refunds han cambiado con distintas actualizaciones del protocolo.

Por ahora basta recordar:

```text
gas utilizado
```

y:

```text
gas finalmente cobrado
```

pueden involucrar reglas adicionales de la EVM.

---

# 70. El coste de los opcodes puede cambiar

Los costes de ciertos opcodes no deben tratarse como reglas eternamente inmutables.

Ethereum puede actualizar el protocolo mediante:

```text
EIPs
```

y hard forks.

Esto significa que una optimización basada en detalles muy específicos del gas debe revisarse con conocimiento de la versión del protocolo utilizada.

---

# 71. No memorices números de gas

Para aprender Solidity no necesitas memorizar:

```text
SLOAD = X

SSTORE = Y

CALL = Z
```

Lo importante inicialmente es comprender las relaciones:

```text
Storage
↓
costoso
```

```text
Memory
↓
temporal
```

```text
Calldata
↓
entrada
```

```text
Opcodes
↓
consumen gas
```

---

# 72. Gas y funciones `view`

Supongamos:

```solidity
function getBalance()
    external
    view
    returns (uint256)
{
    return balance;
}
```

Cuando hacemos una consulta desde fuera mediante RPC:

```text
Frontend
↓
eth_call
↓
Nodo
↓
EVM
```

la ejecución no se incluye como una transacción on-chain.

Por eso el usuario normalmente no paga ETH por esa lectura.

---

# 73. Pero `view` también consume recursos

Aunque una llamada `view` realizada localmente no tenga una comisión on-chain para el usuario, la EVM sigue ejecutando instrucciones.

Por tanto:

```text
view
≠
cero trabajo computacional
```

Simplemente:

```text
no enviamos una transacción on-chain
```

en el caso normal de lectura externa.

---

# 74. `view` dentro de otra transacción

Supongamos:

```solidity
contract A {

    function execute() external {
        B.getNumber();
    }

}
```

Si `execute()` está siendo ejecutada dentro de una transacción, la llamada a:

```text
B.getNumber()
```

forma parte de esa ejecución.

Por tanto:

```text
consume gas
```

aunque `getNumber()` sea una función `view`.

---

# 75. `pure`

Una función:

```solidity
pure
```

no lee ni modifica estado.

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

Si se consulta externamente mediante una llamada local:

```text
no requiere transacción
```

Pero si su ejecución forma parte de otra transacción, sus instrucciones siguen consumiendo gas dentro de esa ejecución.

---

# 76. ¿Quién paga el gas?

Normalmente paga:

```text
la cuenta que envía la transacción
```

Ejemplo:

```text
Alice
↓
firma transacción
↓
Contract
```

Alice necesita suficiente ETH para cubrir:

```text
valor enviado
+
comisión máxima necesaria
```

---

# 77. Ejemplo con ETH + Gas

Alice quiere enviar:

```text
1 ETH
```

y además la transacción tendrá una comisión.

Si Alice tiene exactamente:

```text
1 ETH
```

no necesariamente podrá enviar todo ese ETH, porque también necesita ETH para pagar el gas.

Conceptualmente:

```text
Balance Alice
=
Value
+
Fee
```

---

# 78. `msg.value` no incluye el gas

Supongamos:

```solidity
function deposit() external payable {
}
```

Alice envía:

```text
msg.value = 1 ETH
```

y además paga:

```text
0.001 ETH
```

de comisión.

El contrato recibe:

```text
1 ETH
```

No recibe:

```text
1.001 ETH
```

El gas es un coste separado de `msg.value`.

---

# 79. Ejemplo

Alice tiene:

```text
5 ETH
```

envía:

```text
1 ETH
```

a un contrato.

La comisión es:

```text
0.002 ETH
```

Después, aproximadamente:

```text
Alice:
3.998 ETH
```

El contrato recibe:

```text
1 ETH
```

La diferencia:

```text
0.002 ETH
```

corresponde a la comisión.

---

# 80. La wallet estima las comisiones

Cuando utilizamos una wallet normalmente vemos algo como:

```text
Estimated fee
```

La wallet calcula información relacionada con:

```text
gas estimado

base fee

priority fee

max fee
```

y presenta una estimación al usuario.

Por eso normalmente no calculamos todo manualmente.

---

# 81. Speed de transacciones

Algunas wallets presentan opciones como:

```text
Low

Market

Aggressive
```

o:

```text
Slow

Normal

Fast
```

Estas opciones suelen ajustar parámetros relacionados con la tarifa para cambiar la probabilidad o prioridad de inclusión.

No significa que Ethereum tenga oficialmente tres velocidades.

Es una abstracción de la wallet.

---

# 82. Pending Transactions

Cuando enviamos una transacción puede permanecer:

```text
pending
```

antes de incluirse en un bloque.

Conceptualmente:

```text
Wallet
↓
Transaction
↓
Mempool
↓
Pending
↓
Block
```

Si las condiciones de tarifa no son competitivas, podría tardar más en incluirse.

---

# 83. Mempool

La mempool puede imaginarse como una colección de transacciones pendientes conocidas por los nodos.

```text
Transactions
│
├── Tx A
├── Tx B
├── Tx C
└── Tx D
```

Los validadores construyen bloques a partir de transacciones disponibles y otras reglas del protocolo.

---

# 84. Reemplazar una transacción

Una cuenta utiliza un:

```text
nonce
```

para ordenar sus transacciones.

Una transacción pendiente puede, bajo ciertas condiciones, reemplazarse enviando otra con el mismo nonce y condiciones de tarifa suficientemente superiores.

Esto permite funcionalidades como:

```text
Speed Up
```

o:

```text
Cancel
```

que muestran algunas wallets.

Lo veremos con más detalle en:

```text
transacciones.md
```

---

# 85. Cancelar no significa borrar

Cuando una wallet muestra:

```text
Cancel Transaction
```

normalmente no elimina mágicamente la transacción original de todos los nodos.

Suele intentar reemplazarla mediante otra transacción con:

```text
mismo nonce
```

y condiciones de tarifa adecuadas.

---

# 86. Gas y tokens

Cuando transferimos un token ERC-20:

```text
USDC
TOKEN
DAI
etc.
```

no estamos enviando simplemente el activo nativo.

Estamos llamando una función de un smart contract.

Conceptualmente:

```text
User
↓
Token Contract
↓
transfer()
↓
storage changes
```

Por eso una transferencia ERC-20 consume gas.

---

# 87. ¿En qué se paga el gas de un ERC-20?

Normalmente el gas de una transacción sobre Ethereum se paga con:

```text
ETH
```

aunque estemos transfiriendo otro token.

Ejemplo:

```text
Alice tiene:

100 TOKEN

0 ETH
```

Puede tener tokens pero no suficiente ETH para enviar una transacción estándar que mueva esos tokens.

---

# 88. Gas y NFTs

Transferir un NFT también implica interactuar con un smart contract.

Por ejemplo:

```text
ERC-721 Contract
↓
transferFrom()
```

La función modifica información on-chain.

Por tanto consume gas.

---

# 89. Gas y DeFi

Una operación DeFi puede ejecutar muchas acciones.

Por ejemplo:

```text
Swap
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
Storage updates
```

Esto puede requerir bastante más gas que una simple transferencia.

---

# 90. Ejemplo conceptual de un swap

```text
Usuario
↓
DEX Router
↓
Pool
↓
Transfer Token A
↓
Update reserves
↓
Transfer Token B
↓
Emit events
```

Cada paso puede ejecutar múltiples opcodes.

Por eso:

```text
más complejidad
↓
más gas
```

en términos generales.

---

# 91. Gas y Layers 2

Ethereum también tiene ecosistemas de redes de capa 2.

En ellas, las tarifas pueden funcionar de forma diferente porque una parte del coste depende de cómo esas redes publican o procesan información relacionada con Ethereum.

Más adelante hablaremos de:

```text
L2
```

en:

```text
redes.md
```

Por ahora basta comprender:

```text
Mainnet Ethereum
```

no tiene necesariamente los mismos costes que una:

```text
Layer 2
```

---

# 92. Blob Gas

Ethereum también posee mecanismos específicos para ciertos datos utilizados principalmente por soluciones de escalabilidad.

Uno de ellos utiliza:

```text
blob gas
```

Este mercado de tarifas es diferente del gas normal de ejecución de la EVM.

Para aprender Solidity básico no necesitamos dominarlo todavía.

Basta recordar:

```text
Execution Gas
```

y:

```text
Blob Gas
```

son conceptos relacionados pero distintos.

---

# 93. ¿El desarrollador paga siempre el gas?

No necesariamente.

El desarrollador paga cuando él mismo envía una transacción.

Por ejemplo:

```text
Deploy contract
```

Si el desarrollador despliega el contrato desde su wallet:

```text
developer paga gas
```

Después:

```text
User A llama función
```

normalmente:

```text
User A paga gas
```

---

# 94. Meta-transactions

Existen arquitecturas donde otro participante puede pagar o patrocinar una transacción en nombre del usuario.

Por ejemplo:

```text
Usuario firma mensaje
↓
Relayer
↓
envía transacción
↓
Relayer paga gas
```

Esto permite experiencias donde el usuario puede no necesitar pagar directamente la comisión.

Es un concepto más avanzado.

---

# 95. Account Abstraction

Sistemas modernos de cuentas inteligentes también pueden permitir mecanismos más flexibles para pagar tarifas.

Por ejemplo:

```text
Paymaster
```

puede patrocinar operaciones bajo determinadas condiciones.

Esto no cambia nuestra regla mental básica:

```text
la ejecución tiene un coste
```

pero sí puede cambiar:

```text
quién termina pagando ese coste
```

---

# 96. Gas y seguridad

Una función puede ser vulnerable si un atacante puede hacer que consuma cantidades enormes de gas.

Ejemplo:

```solidity
for (...) {
    ...
}
```

Si un usuario puede controlar el tamaño del loop podría provocar:

```text
Denial of Service
```

por gas.

---

# 97. Denial of Service por gas

Imaginemos:

```solidity
function distribute() external {

    for (uint256 i = 0; i < users.length; i++) {

        // enviar fondos

    }

}
```

Si `users` se vuelve demasiado grande:

```text
gas necesario
↓
demasiado alto
↓
función no ejecutable
```

Esto puede bloquear funcionalidad del contrato.

---

# 98. Pull over Push

Una estrategia común consiste en evitar pagar a todos los usuarios en una sola transacción.

En lugar de:

```text
Contract
↓
paga a Alice
↓
paga a Bob
↓
paga a Carol
↓
paga a David
↓
...
```

podemos permitir:

```text
Alice → claim()

Bob → claim()

Carol → claim()
```

Cada usuario reclama individualmente.

Este patrón puede mejorar escalabilidad y seguridad en ciertos diseños.

---

# 99. Gas Griefing

También existen ataques donde un usuario manipula o aprovecha el consumo de gas para hacer fallar o encarecer determinadas operaciones.

Esto se conoce generalmente como:

```text
gas griefing
```

Lo estudiaremos más adelante dentro de seguridad.

---

# 100. Hardhat y Gas

Hardhat nos permitirá observar cuánto gas consumen nuestras transacciones.

Por ejemplo:

```text
Deploy contract
↓
gas used
```

```text
Call function
↓
gas used
```

Esto es extremadamente útil para comparar implementaciones.

---

# 101. Tests de gas

Más adelante podremos escribir tests y medir operaciones como:

```text
mint()

transfer()

deposit()

withdraw()

swap()
```

y comparar cuánto gas utilizan.

Esto será especialmente útil en:

```text
14-optimizacion-de-gas/
```

---

# 102. Ejemplo de comparación

Supongamos dos funciones:

```text
Implementation A
↓
85,000 gas
```

```text
Implementation B
↓
63,000 gas
```

Si ambas:

* son correctas;
* son seguras;
* producen el mismo comportamiento;

entonces podemos analizar por qué una implementación es más eficiente.

---

# 103. Gas snapshots

En proyectos avanzados podemos guardar referencias de consumo de gas.

Por ejemplo:

```text
transfer()
↓
51,201 gas
```

Después cambiamos el contrato.

```text
transfer()
↓
65,900 gas
```

Esto puede indicar una regresión de gas que vale la pena investigar.

---

# 104. Optimización de gas

Algunas técnicas que estudiaremos más adelante incluyen:

* reducir escrituras en storage;
* storage packing;
* utilizar `calldata` apropiadamente;
* `constant`;
* `immutable`;
* custom errors;
* caching de valores;
* optimización de loops;
* eventos;
* structs;
* mappings;
* assembly en casos justificados;
* optimizaciones del compilador.

---

# 105. Seguridad antes que gas

Nunca debemos hacer algo inseguro únicamente porque ahorra gas.

Por ejemplo:

```text
Implementación A
↓
segura
↓
55,000 gas
```

```text
Implementación B
↓
vulnerable
↓
50,000 gas
```

La implementación B no es mejor.

La prioridad debe ser:

```text
1. Correctitud

2. Seguridad

3. Claridad

4. Optimización
```

---

# 106. Legibilidad también importa

Un ahorro mínimo de gas puede no justificar código extremadamente difícil de entender.

Código difícil de leer puede producir:

* bugs;
* errores de auditoría;
* mantenimiento difícil;
* vulnerabilidades.

Por eso optimizar gas requiere equilibrio.

---

# 107. Ejemplo completo

Imaginemos este contrato:

```solidity
contract Counter {

    uint256 public count;

    function increment() external {
        count++;
    }

}
```

Alice llama:

```text
increment()
```

El flujo conceptual es:

```text
Alice
↓
Wallet
↓
Transaction
↓
Gas Parameters
↓
Ethereum
↓
EVM
↓
Runtime Bytecode
↓
SLOAD
↓
ADD
↓
SSTORE
↓
Gas Used
↓
New State
```

Antes:

```text
count = 5
```

Después:

```text
count = 6
```

Alice paga la comisión correspondiente al trabajo realizado.

---

# 108. Ejemplo con comisión

Supongamos que:

```text
increment()
```

consume:

```text
45,000 gas
```

y el precio efectivo es:

```text
20 gwei
```

Entonces:

```text
45,000 × 20 gwei
=
900,000 gwei
```

En ETH:

```text
0.0009 ETH
```

---

# 109. Si ETH vale dinero

El coste en moneda fiat depende también del precio de ETH.

Por ejemplo:

```text
Fee
=
0.0009 ETH
```

El equivalente en dólares, euros u otra moneda dependerá del precio de ETH en ese momento.

Por eso:

```text
Gas Used
```

puede permanecer igual mientras:

```text
precio en USD
```

cambia.

---

# 110. Tres variables diferentes

Cuando alguien dice:

```text
Ethereum está caro
```

puede estar hablando de distintas cosas.

Debemos distinguir:

```text
Gas Used
```

cantidad de trabajo.

```text
Gas Price
```

precio por unidad.

```text
ETH Price
```

precio de ETH en moneda fiat.

Las tres cosas son diferentes.

---

# 111. Ejemplo

Una función siempre consume aproximadamente:

```text
50,000 gas
```

Pero:

### Momento A

```text
Gas price = 10 gwei
```

### Momento B

```text
Gas price = 100 gwei
```

El código puede consumir el mismo gas, pero la comisión en ETH será mucho mayor en el segundo momento.

---

# 112. Optimizar gas usado vs esperar tarifas bajas

Son estrategias diferentes.

```text
Optimizar contrato
↓
reduce Gas Used
```

Mientras:

```text
esperar menor congestión
↓
puede reducir precio del gas
```

Un desarrollador controla principalmente:

```text
Gas Used
```

mediante el diseño del contrato.

No controla directamente la demanda global de Ethereum.

---

# 113. Modelo mental

Podemos visualizar:

```text
Código Solidity
      ↓
Compiler
      ↓
Bytecode
      ↓
Opcodes
      ↓
Gas Used
```

Después:

```text
Gas Used
×
Effective Gas Price
=
Transaction Fee
```

---

# 114. Modelo EIP-1559

```text
                     Transaction
                          │
             ┌────────────┴────────────┐
             │                         │
        Gas Needed                Fee Settings
             │                         │
        Gas Used               ┌───────┴───────┐
                               │               │
                           Max Fee      Max Priority Fee
                               │
                            Base Fee
                               │
                         Effective Price
                               │
                 Gas Used × Effective Price
                               │
                              Fee
```

---

# 115. Modelo simplificado para principiantes

Si todo lo anterior parece demasiado, recuerda solamente:

```text
Operación
↓
consume gas
```

```text
Gas
↓
tiene un precio
```

```text
Gas consumido × precio
↓
comisión
```

---

# 116. Errores comunes

## Error 1

```text
Gas = ETH
```

Incorrecto.

Gas mide trabajo.

ETH paga ese trabajo.

---

## Error 2

```text
Gas Limit = lo que siempre voy a gastar
```

Incorrecto.

Es el máximo permitido.

---

## Error 3

```text
Si una transacción falla, no pago nada
```

Incorrecto.

La ejecución fallida también puede haber consumido recursos.

---

## Error 4

```text
Las funciones view nunca consumen gas
```

Incorrecto.

Una lectura externa normalmente no genera una comisión on-chain, pero la ejecución sigue requiriendo recursos.

Dentro de otra transacción, una función `view` contribuye al gas consumido.

---

## Error 5

```text
Los ERC-20 pagan gas usando ese mismo token
```

En Ethereum, normalmente necesitas ETH para pagar las tarifas de una transacción estándar.

---

## Error 6

```text
uint8 siempre es más barato que uint256
```

No necesariamente.

Depende del contexto y especialmente del layout de storage.

---

# 117. Preguntas de repaso

Intenta responder:

1. ¿Qué es el gas?
2. ¿Por qué Ethereum necesita gas?
3. ¿Gas y ETH son lo mismo?
4. ¿Qué significa `Gas Used`?
5. ¿Qué significa `Gas Limit`?
6. ¿Qué ocurre si una transacción se queda sin gas?
7. ¿Por qué una transacción fallida puede seguir costando ETH?
8. ¿Qué es Gwei?
9. ¿Cuántos Gwei existen en 1 ETH?
10. ¿Cuántos Wei existen en 1 ETH?
11. ¿Cuál es la fórmula básica de una comisión?
12. ¿Qué es la `base fee`?
13. ¿Qué ocurre con la base fee?
14. ¿Qué es la `priority fee`?
15. ¿Qué es `maxFeePerGas`?
16. ¿Qué es `maxPriorityFeePerGas`?
17. ¿Qué es el `effective gas price`?
18. ¿Por qué escribir en storage suele ser caro?
19. ¿Por qué los loops grandes pueden ser peligrosos?
20. ¿Una función `view` puede consumir gas dentro de otra transacción?
21. ¿Quién paga normalmente el gas?
22. ¿El `msg.value` incluye la comisión?
23. ¿Por qué desplegar un contrato consume gas?
24. ¿Por qué una transferencia ERC-20 necesita ETH?
25. ¿Por qué seguridad debe tener prioridad sobre optimización?

---

# 118. Conceptos que todavía no necesitas dominar

Por ahora no necesitas conocer en profundidad:

```text
Gas schedule exacto de cada opcode

Warm storage

Cold storage

Access lists

Memory expansion

63/64 gas rule

Gas stipend

Refund caps

EIP-2929

EIP-3529

EIP-4844

Blob fee internals

Transient storage

Opcode-level gas profiling

MEV fee mechanics
```

Todos estos conceptos tendrán mucho más sentido después de aprender Solidity y trabajar con contratos reales.

---

# 119. Qué debes recordar

El modelo fundamental es:

```text
Smart Contract
      ↓
Opcodes
      ↓
EVM
      ↓
Gas Used
```

y:

```text
Gas Used
×
Effective Gas Price
=
Transaction Fee
```

También:

```text
Storage writes
↓
generalmente caras
```

```text
Loops grandes
↓
riesgo
```

```text
Transacción fallida
↓
puede seguir costando gas
```

```text
Gas
≠
ETH
```

---

# 120. Relación con lo aprendido

Hasta ahora tenemos:

```text
Ethereum
↓
red blockchain
```

```text
EVM
↓
ejecuta smart contracts
```

```text
Gas
↓
mide el trabajo de esa ejecución
```

Por tanto:

```text
Ethereum
      ↓
EVM
      ↓
Opcodes
      ↓
Gas
      ↓
Transaction Fee
```

---

# 121. Siguiente paso

Ya sabemos:

```text
dónde se ejecuta el contrato
```

con la EVM.

Y ahora sabemos:

```text
cómo se mide el coste de ejecutarlo
```

con gas.

El siguiente concepto fundamental es comprender exactamente qué enviamos a Ethereum cuando queremos modificar el estado.

Continuaremos con:

```text
transacciones.md
```

donde veremos:

* qué es una transacción;
* quién la crea;
* qué contiene;
* `from`;
* `to`;
* `value`;
* `data`;
* `nonce`;
* gas;
* firma;
* hash;
* mempool;
* inclusión en bloques;
* estados `pending`, `success` y `failed`;
* receipts;
* confirmations;
* reemplazo de transacciones.

---

# Resumen

Ethereum necesita una forma de medir cuánto trabajo computacional requiere cada operación.

Esa unidad es:

```text
Gas
```

Cuando enviamos una transacción:

```text
Usuario
↓
Wallet
↓
Transaction
↓
EVM
↓
Opcodes
↓
Gas Used
```

La comisión depende conceptualmente de:

```text
Gas Used
×
Effective Gas Price
```

Con el modelo moderno de tarifas intervienen conceptos como:

```text
Base Fee
Priority Fee
Max Fee
```

La base fee se quema y la priority fee contribuye a incentivar la inclusión de la transacción.

La idea más importante es:

```text
Gas
=
medida de trabajo
```

mientras:

```text
ETH
=
activo utilizado para pagar ese trabajo
```

Cuando más adelante escribamos Solidity, cada decisión que tomemos terminará convirtiéndose en:

```text
Opcodes
↓
Gas
```

Por eso comprender gas es fundamental para aprender:

```text
Solidity

Hardhat

Testing

Seguridad

DeFi

Auditoría

Optimización
```
