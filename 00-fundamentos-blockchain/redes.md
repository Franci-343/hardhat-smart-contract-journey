# Redes en Ethereum

Cuando empezamos a desarrollar smart contracts aparece rápidamente una pregunta:

> ¿En qué blockchain estoy trabajando?

Hasta ahora hemos hablado de Ethereum como si fuera una única red.

Pero durante el desarrollo utilizaremos distintos entornos:

```text
Ethereum Mainnet

Testnets

Redes locales

Layer 2

Otras redes EVM compatibles
```

Cada una tiene:

* su propio estado;
* sus propios bloques;
* sus propias transacciones;
* sus propios balances;
* sus propios contratos;
* su propio `chainId`;
* sus propios nodos;
* sus propios endpoints RPC.

Comprender las redes es fundamental antes de utilizar Hardhat porque cuando despleguemos un contrato tendremos que decidir:

```text
¿Dónde quiero desplegarlo?
```

El flujo habitual será:

```text
Desarrollo
    ↓
Red local
    ↓
Testnet
    ↓
Mainnet
```

Aunque en aplicaciones reales también es muy frecuente:

```text
Desarrollo
    ↓
Red local
    ↓
Testnet
    ↓
Layer 2
```

---

# 1. ¿Qué es una red Ethereum?

Una red Ethereum es un conjunto de nodos que se comunican utilizando las reglas del protocolo Ethereum.

Podemos imaginarla así:

```text
                    RED
                     │
        ┌────────────┼────────────┐
        │            │            │
      Nodo A       Nodo B       Nodo C
        │            │            │
        └────────────┼────────────┘
                     │
              Estado compartido
```

Los nodos participan en tareas como:

* recibir transacciones;
* verificar transacciones;
* ejecutar smart contracts;
* mantener el estado;
* propagar información;
* validar bloques.

---

# 2. No existe solamente una red

Podemos crear múltiples redes que utilizan tecnologías o reglas compatibles con Ethereum.

Por ejemplo:

```text
Ethereum Mainnet
```

es una red.

```text
Sepolia
```

es otra.

Una red local ejecutada en nuestro computador:

```text
Hardhat Network
```

también constituye un entorno independiente.

Todas pueden parecer similares desde Solidity, pero sus estados son completamente diferentes.

---

# 3. Cada red tiene su propio estado

Supongamos que nuestra dirección es:

```text
0xABC...
```

En Mainnet podría tener:

```text
Mainnet

0xABC...
↓
2 ETH
```

Mientras que en una testnet podría tener:

```text
Sepolia

0xABC...
↓
5 test ETH
```

Y en nuestra red local:

```text
Local

0xABC...
↓
10,000 ETH de prueba
```

Aunque la dirección sea exactamente la misma:

```text
0xABC...
```

los balances pertenecen a estados diferentes.

---

# 4. Las redes no comparten automáticamente información

Supongamos:

```text
Mainnet
Alice = 2 ETH
```

Eso no significa:

```text
Sepolia
Alice = 2 ETH
```

Cada blockchain tiene su propio estado.

Podemos visualizarlo así:

```text
               misma dirección
                    0xABC
                      │
          ┌───────────┼───────────┐
          │           │           │
       Mainnet      Sepolia      Local
          │           │           │
        2 ETH       8 ETH       10,000 ETH
```

Son tres estados independientes.

---

# 5. Los contratos tampoco se comparten

Supongamos que desplegamos:

```solidity
contract Counter {

    uint256 public count;

}
```

en Sepolia.

Obtendremos una dirección como:

```text
0x123...
```

Ese contrato existe:

```text
Sepolia
↓
0x123...
↓
Counter
```

Pero eso no significa que exista automáticamente en:

```text
Mainnet
```

Para utilizarlo allí tendríamos que desplegarlo nuevamente.

---

# 6. Mismo código, contratos diferentes

Podemos desplegar exactamente el mismo código en varias redes:

```text
Counter.sol
    │
    ├── Mainnet
    │      ↓
    │   Contract A
    │
    ├── Sepolia
    │      ↓
    │   Contract B
    │
    └── Local
           ↓
        Contract C
```

Cada contrato tendrá su propio:

* estado;
* balance;
* historial;
* almacenamiento;
* transacciones.

---

# 7. Ethereum Mainnet

La red principal de producción de Ethereum se conoce como:

```text
Ethereum Mainnet
```

También podemos verla simplemente como:

```text
Mainnet
```

Es donde:

* ETH tiene valor económico real;
* se ejecutan aplicaciones reales;
* existen protocolos DeFi;
* existen tokens reales;
* existen NFTs reales;
* las transacciones cuestan ETH real.

---

# 8. Mainnet es producción

Podemos comparar desarrollo blockchain con desarrollo web.

```text
Web tradicional
```

podría tener:

```text
Local
↓
Staging
↓
Production
```

En Ethereum podemos pensar:

```text
Local
↓
Testnet
↓
Mainnet
```

Por tanto:

```text
Mainnet
≈
Production
```

---

# 9. En Mainnet los errores cuestan dinero

Supongamos que desplegamos accidentalmente un contrato incorrecto.

El deployment consume:

```text
ETH real
```

Si además el contrato contiene una vulnerabilidad, pueden existir fondos reales en riesgo.

Por eso nunca deberíamos utilizar Mainnet como nuestro primer entorno de prueba.

---

# 10. Flujo recomendado

Durante este recorrido seguiremos aproximadamente:

```text
Escribir contrato
      ↓
Compilar
      ↓
Tests
      ↓
Red local
      ↓
Testnet
      ↓
Revisión
      ↓
Mainnet
```

Para contratos importantes todavía añadiríamos pasos como:

```text
Auditoría

Fuzzing

Invariant Testing

Security Review
```

antes del deployment final.

---

# 11. Chain ID

Cada red utiliza un identificador llamado:

```text
chainId
```

El `chainId` permite identificar la blockchain donde estamos operando.

Por ejemplo:

```text
Ethereum Mainnet
↓
chainId = 1
```

Cuando una wallet cambia de red, una de las informaciones fundamentales que utiliza es precisamente:

```text
chainId
```

---

# 12. ¿Por qué existe el Chain ID?

Imaginemos dos redes.

```text
Network A
```

y:

```text
Network B
```

Necesitamos poder identificar para qué blockchain está destinada una transacción.

El `chainId` ayuda a distinguirlas.

Conceptualmente:

```text
Transaction
│
├── from
├── to
├── value
├── data
├── nonce
└── chainId
```

---

# 13. Chain ID y firmas

El `chainId` también forma parte de los mecanismos que permiten evitar que ciertas transacciones firmadas para una red sean reutilizadas ingenuamente en otra.

Conceptualmente:

```text
Firma
+
Chain ID
↓
Transacción asociada a una red
```

Este concepto está relacionado con:

```text
Replay Protection
```

que veremos más adelante.

---

# 14. Ejemplos de Chain IDs

Algunos ejemplos conocidos:

```text
Ethereum Mainnet
chainId = 1
```

```text
Sepolia
chainId = 11155111
```

Durante desarrollo local es común encontrar configuraciones como:

```text
31337
```

aunque una red local puede configurarse con otro `chainId`.

---

# 15. Chain ID no es una dirección

No confundas:

```text
chainId
```

con:

```text
address
```

Una dirección identifica una cuenta o contrato.

```text
0xABC...
```

Un `chainId` identifica una red.

```text
1
```

Conceptualmente:

```text
chainId
↓
¿qué blockchain?
```

```text
address
↓
¿qué cuenta/contrato?
```

---

# 16. ¿Qué es una Testnet?

Una:

```text
Testnet
```

es una red utilizada para realizar pruebas.

Se intenta que su comportamiento sea suficientemente parecido al entorno real para poder probar:

* contratos;
* deployments;
* wallets;
* frontends;
* transacciones;
* integraciones;
* scripts.

Pero sin utilizar ETH de Mainnet.

---

# 17. ETH de Testnet

Las testnets utilizan ETH de prueba.

Por ejemplo:

```text
Sepolia ETH
```

Ese ETH se utiliza para:

```text
pagar gas
```

dentro de Sepolia.

Pero:

```text
Sepolia ETH
≠
Mainnet ETH
```

---

# 18. Test ETH no debería considerarse dinero real

El propósito del ETH de testnet es permitir desarrollo y experimentación.

Por ejemplo:

```text
10 Sepolia ETH
```

no significa:

```text
10 Mainnet ETH
```

Son activos pertenecientes a redes diferentes.

---

# 19. ¿Cómo conseguimos ETH de prueba?

Normalmente mediante:

```text
Faucets
```

Un faucet es un servicio que entrega pequeñas cantidades de tokens de prueba.

Conceptualmente:

```text
Developer
↓
introduce dirección
↓
Faucet
↓
envía test ETH
↓
Wallet
```

---

# 20. ¿Para qué necesitamos Test ETH?

Aunque sea una testnet, las transacciones siguen utilizando gas.

Por ejemplo:

```text
Deploy Counter
↓
consume gas
```

```text
Counter.increment()
↓
consume gas
```

Por tanto necesitamos:

```text
test ETH
```

para pagar las comisiones de esa red.

---

# 21. Sepolia

Una de las testnets utilizadas para desarrollo de smart contracts y aplicaciones Ethereum es:

```text
Sepolia
```

Durante este repositorio será una buena candidata para practicar:

```text
Hardhat
↓
Deploy
↓
Sepolia
```

antes de pensar en Mainnet.

---

# 22. Hoodi

Existe también:

```text
Hoodi
```

que está especialmente orientada a pruebas relacionadas con:

* validadores;
* staking;
* infraestructura;
* upgrades del protocolo.

Para desarrollar smart contracts y dApps normalmente nos interesa más una testnet orientada al desarrollo de aplicaciones, como Sepolia.

---

# 23. Testnets antiguas

Si buscas tutoriales antiguos probablemente encontrarás nombres como:

```text
Ropsten

Rinkeby

Kovan

Goerli

Holesky
```

Muchas de estas redes ya fueron retiradas o deprecadas.

Esto ocurre porque:

```text
las testnets también evolucionan
```

Por eso siempre debemos revisar documentación actualizada antes de configurar una red.

---

# 24. Tutoriales antiguos pueden estar desactualizados

Puedes encontrar un tutorial que diga:

```text
Deploy to Rinkeby
```

pero eso no significa que debas utilizar Rinkeby actualmente.

Otro puede utilizar:

```text
Goerli
```

aunque ya no sea la testnet apropiada.

Una habilidad importante como desarrollador blockchain es detectar:

```text
tutorial actualizado
```

vs:

```text
tutorial históricamente útil pero desactualizado
```

---

# 25. No reutilices irresponsablemente cuentas

Aunque técnicamente una misma clave privada puede producir la misma dirección en múltiples redes, para desarrollo profesional es buena práctica separar entornos.

Por ejemplo:

```text
Wallet desarrollo
```

y:

```text
Wallet producción
```

No deberíamos utilizar alegremente claves privadas con fondos reales dentro de:

* scripts experimentales;
* repositorios;
* archivos `.env` mal protegidos;
* testnets;
* demos;
* herramientas desconocidas.

---

# 26. Nunca publiques una private key

Nunca hagas esto:

```javascript
const PRIVATE_KEY =
    "0x123456789...";
```

y luego:

```bash
git add .
git commit
git push
```

Si publicas una private key:

```text
cualquier persona que la obtenga
↓
puede firmar
↓
puede controlar esa cuenta
```

---

# 27. Redes locales

Antes de una testnet podemos trabajar con una:

```text
Local Development Network
```

Es una blockchain ejecutada específicamente para desarrollo.

Por ejemplo:

```text
Nuestro computador
      ↓
Hardhat
      ↓
Blockchain local
```

---

# 28. ¿Por qué utilizar una red local?

Una red local ofrece enormes ventajas.

Podemos:

* desplegar instantáneamente;
* probar miles de veces;
* reiniciar el estado;
* utilizar cuentas falsas;
* tener ETH de prueba;
* depurar;
* manipular bloques;
* manipular tiempo;
* probar errores;
* automatizar tests.

Y todo sin gastar ETH real.

---

# 29. Hardhat Network

Hardhat proporciona un entorno de red diseñado específicamente para desarrollo Ethereum.

Conceptualmente:

```text
Hardhat
   │
   ├── Compiler
   ├── Tests
   ├── Scripts
   └── Local Network
```

Cuando lleguemos a:

```text
04-hardhat/
```

utilizaremos esta capacidad constantemente.

---

# 30. Cuentas locales

Una red local puede generar cuentas de desarrollo automáticamente.

Por ejemplo:

```text
Account 0
↓
10,000 ETH falsos
```

```text
Account 1
↓
10,000 ETH falsos
```

```text
Account 2
↓
10,000 ETH falsos
```

Estos fondos:

```text
solo existen en nuestra blockchain local
```

---

# 31. El ETH local no vale dinero

Si Hardhat muestra:

```text
10000 ETH
```

eso no significa que acabamos de volvernos millonarios.

Ese ETH pertenece exclusivamente al estado de:

```text
nuestra red local
```

Si eliminamos o reiniciamos la red:

```text
estado
↓
desaparece
```

---

# 32. Podemos reiniciar una red local

Una ventaja fundamental:

```text
Estado inicial
↓
Tests
↓
Estado modificado
↓
Reset
↓
Estado inicial
```

Esto hace posibles tests reproducibles.

---

# 33. Ejemplo

Queremos probar:

```solidity
function deposit() external payable;
```

Podemos ejecutar:

```text
Test 1
Alice deposita 1 ETH
```

Después reiniciamos.

```text
Test 2
Alice deposita 100 ETH
```

Después reiniciamos.

```text
Test 3
Alice deposita 0 ETH
```

Todo ocurre sin dinero real.

---

# 34. Blockchain local vs Testnet

No son lo mismo.

## Local

```text
Tu computador
↓
Hardhat
↓
Blockchain privada de desarrollo
```

Ventajas:

```text
rápida

gratis

controlable

reiniciable

ideal para tests
```

---

## Testnet

```text
Internet
↓
red pública
↓
múltiples participantes
```

Ventajas:

```text
más cercana a un entorno real

permite probar frontend

permite probar wallets

permite compartir contratos con otros
```

---

# 35. Local vs Testnet vs Mainnet

```text
┌─────────────┬──────────────┬──────────────┐
│    Local    │   Testnet    │   Mainnet    │
├─────────────┼──────────────┼──────────────┤
│ Desarrollo  │ Pruebas      │ Producción   │
│ rápido      │ públicas     │ real         │
│ gratis      │ test ETH     │ ETH real     │
│ controlable │ compartida   │ compartida   │
│ reiniciable │ persistente  │ persistente  │
└─────────────┴──────────────┴──────────────┘
```

---

# 36. Flujo profesional básico

Una primera aproximación sería:

```text
Solidity
   ↓
Compile
   ↓
Unit Tests
   ↓
Hardhat Local
   ↓
Integration Tests
   ↓
Testnet
   ↓
Review
   ↓
Mainnet
```

Nunca deberíamos depender solamente de:

```text
"funcionó en Sepolia"
```

como demostración de que un contrato es seguro.

---

# 37. ¿Cómo nos comunicamos con una red?

Para interactuar con Ethereum necesitamos comunicarnos con un nodo.

Por ejemplo:

```text
Aplicación
↓
Nodo
↓
Ethereum
```

Esto suele hacerse mediante:

```text
RPC
```

---

# 38. ¿Qué es RPC?

RPC significa:

```text
Remote Procedure Call
```

En términos sencillos, es una interfaz que permite que una aplicación solicite operaciones a un nodo.

Por ejemplo:

```text
Frontend
↓
RPC
↓
Ethereum Node
```

---

# 39. Ejemplo de consulta RPC

Nuestra aplicación puede preguntar:

```text
¿Cuál es el balance de 0xABC...?
```

Conceptualmente:

```text
App
↓
RPC Request
↓
Node
↓
Blockchain
↓
RPC Response
↓
Balance
```

---

# 40. JSON-RPC

Ethereum utiliza normalmente una API basada en:

```text
JSON-RPC
```

Por ejemplo, existen métodos como:

```text
eth_getBalance
```

```text
eth_call
```

```text
eth_sendRawTransaction
```

```text
eth_getTransactionReceipt
```

```text
eth_blockNumber
```

No necesitamos memorizarlos todavía.

Librerías como:

```text
ethers.js
```

nos permiten trabajar con ellos mediante abstracciones más cómodas.

---

# 41. Ejemplo conceptual

En lugar de escribir manualmente:

```text
eth_getBalance
```

podremos hacer algo parecido a:

```javascript
const balance =
    await provider.getBalance(address);
```

Internamente:

```text
ethers
↓
RPC
↓
Ethereum Node
```

---

# 42. ¿Qué es un RPC URL?

Para saber a qué nodo conectarnos necesitamos una dirección.

Por ejemplo:

```text
https://...
```

Esto suele llamarse:

```text
RPC URL
```

Conceptualmente:

```text
Hardhat
↓
RPC URL
↓
Nodo
↓
Sepolia
```

---

# 43. Cada red necesita el RPC correcto

Supongamos:

```text
RPC A
↓
Mainnet
```

y:

```text
RPC B
↓
Sepolia
```

Si nuestro programa está conectado al RPC de Sepolia:

```text
provider.getBalance(...)
```

obtendrá el balance:

```text
de Sepolia
```

no el de Mainnet.

---

# 44. El provider

En librerías Ethereum aparece frecuentemente el concepto:

```text
Provider
```

Un provider representa nuestra conexión con una red blockchain.

Conceptualmente:

```text
JavaScript
↓
Provider
↓
RPC
↓
Node
↓
Network
```

---

# 45. Provider vs Signer

Más adelante veremos una diferencia importante:

```text
Provider
↓
conexión a blockchain
```

```text
Signer
↓
capacidad de firmar
```

Por ejemplo:

```text
Provider
↓
leer balance
```

Mientras:

```text
Signer
↓
firmar transacción
↓
enviar transacción
```

---

# 46. Leer no es lo mismo que firmar

Podemos conectarnos a Ethereum y consultar:

```text
balance

bloques

contratos

transacciones
```

sin tener ninguna clave privada.

```text
Provider
↓
Read
```

Pero para enviar una transacción desde una cuenta necesitamos:

```text
Signer
↓
Private Key
↓
Signature
```

---

# 47. Proveedores RPC

No necesariamente tenemos que ejecutar nuestro propio nodo.

Existen servicios que ejecutan infraestructura Ethereum y ofrecen endpoints RPC.

Conceptualmente:

```text
Nuestra dApp
↓
RPC Provider
↓
Ethereum Nodes
↓
Ethereum
```

Más adelante podremos utilizar este tipo de servicios al desplegar contratos.

---

# 48. También podemos ejecutar nuestro propio nodo

Otra posibilidad es:

```text
Nuestro servidor
↓
Ethereum Client
↓
Nodo
↓
Ethereum
```

Esto ofrece mayor control, pero requiere más infraestructura.

Para comenzar con Hardhat normalmente no necesitaremos operar nuestro propio nodo de Mainnet.

---

# 49. ¿Qué es un block explorer?

Un:

```text
Block Explorer
```

es una aplicación que permite explorar información pública de una blockchain.

Puede mostrarnos:

* bloques;
* transacciones;
* direcciones;
* balances;
* contratos;
* eventos;
* tokens;
* gas.

---

# 50. Ejemplo conceptual

Desplegamos:

```text
Counter
```

y obtenemos:

```text
0x123...
```

En un block explorer podemos buscar:

```text
0x123...
```

y observar información relacionada con el contrato.

---

# 51. Cada red puede tener su propio explorer

Un explorer de Mainnet muestra información de:

```text
Mainnet
```

Mientras un explorer de Sepolia muestra:

```text
Sepolia
```

No debemos confundirlos.

---

# 52. Una transaction hash pertenece a una red

Supongamos que tenemos:

```text
0x987...
```

como hash de una transacción.

Si ocurrió en Sepolia:

```text
Sepolia Explorer
↓
0x987...
↓
Transaction
```

Buscarlo en Mainnet podría no producir ningún resultado.

---

# 53. Los contratos también pertenecen a una red

Cuando alguien nos dice:

```text
Contract address:
0xABC...
```

falta información.

También necesitamos saber:

```text
¿en qué red?
```

Una dirección sin contexto de red puede ser ambigua.

---

# 54. Dirección + Chain ID

Una forma mental más completa de identificar un contrato sería:

```text
Network
+
Contract Address
```

Por ejemplo:

```text
Ethereum Mainnet
+
0xABC...
```

No únicamente:

```text
0xABC...
```

---

# 55. La misma dirección puede existir en varias redes

Supongamos:

```text
0xABC...
```

En Mainnet podría existir:

```text
Token Contract
```

En Sepolia podría existir:

```text
Counter Contract
```

Y localmente podría no existir nada.

Por eso siempre debemos saber:

```text
address + network
```

---

# 56. Tokens también dependen de la red

Supongamos que encontramos:

```text
USDC
```

Debemos conocer:

```text
qué contrato
```

y:

```text
qué red
```

porque los tokens son contratos desplegados en redes específicas.

---

# 57. El símbolo de un token no demuestra nada

Cualquiera puede desplegar un contrato y poner:

```solidity
string public symbol = "USDC";
```

Eso no convierte automáticamente ese contrato en el USDC legítimo.

Por eso nunca debemos identificar un token únicamente mediante:

```text
name
```

o:

```text
symbol
```

Necesitamos verificar:

```text
network

contract address

fuente confiable
```

---

# 58. Cambiar de red en una wallet

Las wallets permiten seleccionar redes.

Conceptualmente:

```text
Wallet
│
├── Ethereum Mainnet
├── Sepolia
├── Layer 2 A
└── Layer 2 B
```

Al cambiar de red cambia:

```text
RPC

chainId

balance mostrado

contratos visibles

historial relevante
```

---

# 59. La private key puede producir la misma address

Una misma clave privada puede controlar la misma dirección en distintas redes EVM.

Por ejemplo:

```text
Private Key
↓
Address 0xABC...
```

Podemos encontrar:

```text
Mainnet
0xABC...
```

```text
Sepolia
0xABC...
```

```text
L2
0xABC...
```

Pero nuevamente:

```text
sus estados son independientes
```

---

# 60. Nonce por red

El nonce de una cuenta tampoco tiene por qué ser igual en diferentes redes.

Ejemplo:

```text
Mainnet

Alice
nonce = 45
```

```text
Sepolia

Alice
nonce = 3
```

```text
Local

Alice
nonce = 0
```

Porque cada red tiene su propio historial.

---

# 61. Layer 1

Ethereum Mainnet puede describirse como una:

```text
Layer 1
```

o:

```text
L1
```

Es la capa base donde:

* se ejecuta consenso;
* existe el estado de Ethereum;
* se liquidan transacciones;
* se asegura la red.

---

# 62. Problema de escalabilidad

Ethereum tiene capacidad limitada.

Cuando muchas personas quieren utilizar la red:

```text
más demanda
↓
más competencia
↓
gas puede encarecerse
```

Una estrategia importante para escalar Ethereum consiste en utilizar:

```text
Layer 2
```

---

# 63. ¿Qué es una Layer 2?

Una:

```text
Layer 2
```

o:

```text
L2
```

es una red de escalado construida para extender Ethereum.

De manera simplificada:

```text
Usuarios
↓
Layer 2
↓
muchas transacciones
↓
Ethereum L1
```

La L2 procesa actividad fuera de la ejecución directa de cada operación individual en Mainnet y utiliza Ethereum de distintas maneras para seguridad, liquidación o disponibilidad de datos según su diseño.

---

# 64. ¿Por qué utilizar una L2?

Las L2 buscan ofrecer:

```text
más capacidad
```

y generalmente:

```text
menores costes para usuarios
```

sin intentar reemplazar completamente Ethereum como capa base.

---

# 65. Modelo simplificado

En lugar de hacer:

```text
Tx A → Ethereum L1

Tx B → Ethereum L1

Tx C → Ethereum L1

Tx D → Ethereum L1
```

una solución de escalado puede procesar muchas operaciones y publicar información relacionada con ellas en Ethereum.

Conceptualmente:

```text
Tx A
Tx B
Tx C
Tx D
  ↓
Layer 2
  ↓
datos / compromiso / prueba
  ↓
Ethereum
```

---

# 66. Rollups

Uno de los mecanismos principales utilizados por L2 son:

```text
Rollups
```

La idea general es agrupar grandes cantidades de actividad y utilizar Ethereum como capa fundamental.

Existen dos grandes familias que encontraremos frecuentemente:

```text
Optimistic Rollups
```

y:

```text
ZK Rollups
```

---

# 67. Optimistic Rollups

De manera extremadamente simplificada:

```text
Transacciones
↓
L2
↓
Batch
↓
Ethereum
```

Su modelo incluye mecanismos para detectar o disputar estados incorrectos según las reglas del sistema.

No necesitamos entender todavía todos sus detalles criptográficos.

---

# 68. ZK Rollups

Otra familia utiliza:

```text
Zero-Knowledge Proofs
```

para demostrar propiedades sobre las transiciones de estado.

Conceptualmente:

```text
muchas transacciones
↓
cálculo L2
↓
prueba
↓
Ethereum
```

Más adelante podremos profundizar en estos modelos.

---

# 69. Ejemplos de redes L2

En el ecosistema Ethereum podemos encontrar redes como:

```text
Arbitrum

Base

Optimism

zkSync

Starknet

Linea
```

Entre otras.

No todas utilizan exactamente la misma arquitectura.

---

# 70. No todas las L2 son iguales

Debemos evitar pensar:

```text
L2 = todas funcionan exactamente igual
```

Cada red puede tener diferencias en:

* arquitectura;
* seguridad;
* pruebas;
* secuenciación;
* disponibilidad de datos;
* bridges;
* finalización;
* compatibilidad EVM;
* upgrades.

---

# 71. L2 no significa automáticamente segura

El hecho de que una red se describa como:

```text
Layer 2
```

no significa que debamos asumir que tiene exactamente las mismas propiedades de seguridad que Ethereum Mainnet.

Debemos analizar:

```text
maturity

security model

upgrade mechanisms

bridge

sequencer

proof system

data availability
```

especialmente antes de manejar fondos importantes.

---

# 72. EVM Compatibility

Muchas redes intentan ser compatibles con:

```text
EVM
```

Esto permite utilizar herramientas similares:

```text
Solidity

Hardhat

ethers.js

MetaMask
```

en varias redes.

Conceptualmente:

```text
Solidity Contract
      ↓
EVM-compatible network
```

---

# 73. Pero EVM compatible no significa Ethereum L2

Este punto es muy importante.

Una blockchain puede ser:

```text
EVM compatible
```

sin ser:

```text
Ethereum Layer 2
```

Son conceptos diferentes.

---

# 74. EVM compatible

Significa aproximadamente que la red permite ejecutar contratos utilizando un entorno compatible con la EVM.

Por ejemplo:

```text
Solidity
↓
Compile
↓
EVM Bytecode
↓
Network
```

---

# 75. Layer 2

Describe una relación de escalabilidad y seguridad con una blockchain base.

Por tanto:

```text
EVM compatibility
```

habla principalmente de:

```text
ejecución
```

Mientras:

```text
Layer 2
```

habla de:

```text
arquitectura de escalado
+
relación con Ethereum
```

---

# 76. Sidechains

También podemos encontrar:

```text
Sidechains
```

Una sidechain es una blockchain independiente que puede interactuar con Ethereum mediante mecanismos como bridges.

Conceptualmente:

```text
Ethereum
   │
 Bridge
   │
Sidechain
```

Pero no debemos asumir que hereda automáticamente las mismas garantías de seguridad que Ethereum.

---

# 77. L2 vs Sidechain

Simplificando mucho:

```text
Layer 2
↓
diseñada para escalar Ethereum
↓
utiliza Ethereum para propiedades fundamentales
```

Mientras:

```text
Sidechain
↓
blockchain independiente
↓
su propio modelo de seguridad
```

Esta distinción será importante cuando analicemos arquitecturas más avanzadas.

---

# 78. Otras Layer 1

También existen otras blockchains independientes.

Conceptualmente:

```text
Ethereum
↓
L1
```

```text
Blockchain X
↓
otra L1
```

Algunas pueden ser compatibles con la EVM.

Pero:

```text
EVM-compatible L1
≠
Ethereum
```

---

# 79. Bridges

Si las redes tienen estados independientes aparece un problema:

```text
¿Cómo movemos activos entre redes?
```

Para eso existen sistemas conocidos como:

```text
bridges
```

o:

```text
puentes
```

---

# 80. Un bridge no teletransporta literalmente un token

Supongamos que queremos utilizar un activo en otra red.

Conceptualmente podría ocurrir algo parecido a:

```text
Network A
↓
bloquear / quemar / registrar activo
↓
Bridge
↓
Network B
↓
liberar / acuñar / representar activo
```

El mecanismo exacto depende del bridge.

---

# 81. Bridge Risk

Los bridges son componentes especialmente sensibles.

Pueden introducir riesgos relacionados con:

* smart contracts;
* firmas;
* validadores;
* multisigs;
* oráculos;
* mensajes cross-chain;
* upgrades;
* relayers.

Por tanto:

```text
Bridge
≠
movimiento mágico sin riesgo
```

---

# 82. Cross-chain

Cuando dos blockchains interactúan hablamos frecuentemente de:

```text
cross-chain
```

Por ejemplo:

```text
Ethereum
↓
message
↓
Layer 2
```

o:

```text
Chain A
↓
Bridge
↓
Chain B
```

Este tipo de sistemas introduce complejidad adicional.

---

# 83. Un smart contract no ve automáticamente otras redes

Supongamos que tenemos:

```text
Contract A
```

en Ethereum.

Y:

```text
Contract B
```

en otra red.

`Contract A` no puede simplemente hacer:

```solidity
ContractB.doSomething();
```

como si ambos estuvieran en la misma EVM.

Son blockchains separadas.

---

# 84. Comunicación Cross-chain

Para comunicarse entre redes necesitamos protocolos especializados.

Conceptualmente:

```text
Contract A
↓
Cross-chain protocol
↓
Message
↓
Network B
↓
Contract B
```

Esto introduce nuevas suposiciones de seguridad.

---

# 85. Fork de una red

Durante desarrollo también podemos crear algo extremadamente útil:

```text
Mainnet Fork
```

Esto consiste en crear un entorno local basado en el estado de una red existente.

Conceptualmente:

```text
Ethereum Mainnet
      ↓
      copy state
      ↓
Local Fork
```

---

# 86. ¿Por qué usar un Mainnet Fork?

Supongamos que queremos probar una integración con:

```text
Uniswap
```

En lugar de desplegar manualmente todos sus contratos podemos utilizar un fork que contenga estado existente.

Entonces:

```text
Hardhat
↓
Mainnet Fork
↓
Contratos existentes
↓
Tests locales
```

---

# 87. Fork no es Mainnet real

Aunque tengamos una copia del estado:

```text
Local Fork
≠
Mainnet
```

Las transacciones que hagamos localmente:

```text
no modifican Ethereum Mainnet
```

Solo modifican nuestro entorno local.

---

# 88. Forking y DeFi

El forking será extremadamente útil cuando lleguemos a:

```text
10-defi/
```

porque podremos probar sistemas que interactúan con contratos reales.

Ejemplo:

```text
Fork Mainnet
↓
Uniswap
↓
Nuestro Contract
↓
Swap
↓
Tests
```

sin arriesgar dinero real.

---

# 89. Fork en un bloque específico

También podemos crear un fork utilizando el estado correspondiente a un bloque concreto.

Conceptualmente:

```text
Mainnet
↓
Block 20,000,000
↓
Fork
```

Esto permite crear tests más reproducibles.

---

# 90. Red pública vs privada

No todas las blockchains necesitan ser públicas.

Una red pública permite que cualquier persona pueda, según las reglas del protocolo:

```text
leer

enviar transacciones

interactuar
```

Mientras una red privada puede restringir:

```text
nodos

usuarios

validadores

acceso
```

---

# 91. Ethereum Mainnet es pública

Ethereum Mainnet es:

```text
public

permissionless
```

Esto significa que no necesitamos autorización de una empresa central para crear:

```text
una cuenta
```

o desplegar:

```text
un smart contract
```

siempre que podamos pagar las tarifas necesarias.

---

# 92. Permissioned Networks

También pueden crearse redes donde ciertos participantes están autorizados explícitamente.

Por ejemplo:

```text
Empresa A
Empresa B
Empresa C
      ↓
Private Ethereum-compatible Network
```

Esto es diferente del modelo abierto de Ethereum Mainnet.

---

# 93. Red y moneda nativa

Cada red normalmente tiene un activo utilizado para pagar gas.

En Ethereum Mainnet:

```text
ETH
```

En testnets Ethereum:

```text
test ETH
```

En otras redes EVM compatibles el activo nativo puede variar.

---

# 94. No asumas que todo gas se paga con ETH

En Ethereum:

```text
Gas
↓
ETH
```

Pero una red EVM compatible independiente podría utilizar:

```text
otro native token
```

para pagar gas.

Por tanto debemos distinguir:

```text
EVM compatibility
```

de:

```text
native currency
```

---

# 95. Configuración de una red

Cuando configuramos una wallet o herramienta podemos necesitar información como:

```text
Network Name

RPC URL

Chain ID

Native Currency

Block Explorer
```

Por ejemplo conceptualmente:

```text
Network:
Sepolia

RPC:
https://...

Chain ID:
11155111

Currency:
ETH

Explorer:
...
```

---

# 96. Hardhat y redes

Más adelante configuraremos redes en Hardhat.

Conceptualmente tendremos algo parecido a:

```text
Hardhat Config
│
├── local
│
├── sepolia
│
└── mainnet
```

Después podremos elegir dónde ejecutar un script.

---

# 97. Deploy local

```text
Hardhat
↓
Local Network
↓
deploy
↓
Counter
```

No requiere ETH real.

---

# 98. Deploy Testnet

```text
Hardhat
↓
RPC
↓
Sepolia
↓
deploy
↓
Counter
```

Necesitaremos:

```text
test ETH
```

---

# 99. Deploy Mainnet

```text
Hardhat
↓
RPC
↓
Ethereum Mainnet
↓
deploy
↓
Counter
```

Necesitaremos:

```text
ETH real
```

y debemos tener mucha más precaución.

---

# 100. Misma herramienta, diferentes consecuencias

El comando conceptualmente puede parecer casi idéntico:

```text
deploy
```

Pero:

```text
Local
↓
sin riesgo económico real
```

```text
Testnet
↓
pruebas públicas
```

```text
Mainnet
↓
dinero real
```

Por eso verificar la red antes de ejecutar un deployment es crítico.

---

# 101. Error clásico: desplegar en la red equivocada

Imaginemos que queremos desplegar en:

```text
Sepolia
```

pero nuestro RPC apunta a:

```text
Mainnet
```

Si nuestra cuenta tiene ETH:

```text
podemos terminar gastando dinero real
```

Por eso siempre debemos comprobar:

```text
network

chainId

account

balance
```

antes de deployments importantes.

---

# 102. Otro error: dirección correcta, red incorrecta

Tenemos:

```text
Token address:
0xABC...
```

Pero nuestra aplicación está conectada a:

```text
Sepolia
```

mientras ese contrato existe en:

```text
Mainnet
```

La aplicación puede mostrar errores porque:

```text
0xABC...
```

en Sepolia no contiene el contrato esperado.

---

# 103. Otro error: saldo desaparecido

Un usuario tiene:

```text
2 ETH
```

pero cambia de Mainnet a Sepolia.

Ahora ve:

```text
0 ETH
```

Sus ETH no desaparecieron.

Simplemente está observando:

```text
otro estado
```

---

# 104. Cambiar de red no mueve activos

Esto es fundamental:

```text
Switch Network
≠
Bridge Assets
```

Si cambiamos en MetaMask:

```text
Ethereum
↓
Base
```

solo estamos diciendo:

```text
ahora muéstrame/interactúa con esta red
```

No estamos moviendo automáticamente ningún activo.

---

# 105. Mover activos es otra operación

Para trasladar valor entre redes puede ser necesario utilizar:

```text
bridge
```

o mecanismos específicos.

Por tanto:

```text
Network Switch
```

y:

```text
Asset Transfer Between Networks
```

son cosas completamente diferentes.

---

# 106. Confirmaciones

Una transacción incluida en un bloque puede recibir bloques posteriores encima.

Conceptualmente:

```text
Block 100
└── nuestra transaction

Block 101

Block 102

Block 103
```

Podemos hablar entonces de:

```text
confirmations
```

---

# 107. Finalidad

En sistemas blockchain también aparece el concepto:

```text
finality
```

que describe cuándo un bloque puede considerarse suficientemente final según las reglas del protocolo.

No debemos confundir:

```text
transaction sent
```

con:

```text
transaction included
```

ni necesariamente con:

```text
transaction finalized
```

---

# 108. Las diferentes redes pueden tener diferentes tiempos

No todas las redes producen bloques o alcanzan finalidad siguiendo exactamente las mismas características.

Por ejemplo:

```text
Network A
↓
comportamiento A
```

```text
Network B
↓
comportamiento B
```

Esto importa especialmente en:

* exchanges;
* bridges;
* pagos;
* protocolos cross-chain.

---

# 109. Network congestion

Una red puede experimentar:

```text
congestión
```

cuando existe mucha demanda.

Conceptualmente:

```text
muchas transactions
↓
espacio limitado
↓
competencia
↓
fees mayores
```

Las condiciones pueden variar considerablemente entre redes.

---

# 110. La misma función puede costar diferente dinero

Supongamos que:

```solidity
mint();
```

consume:

```text
80,000 gas
```

en dos redes EVM compatibles.

El:

```text
Gas Used
```

podría ser parecido.

Pero el:

```text
precio del gas
```

y:

```text
valor del native token
```

pueden ser diferentes.

Por tanto el coste económico puede cambiar.

---

# 111. Estado diferente también puede cambiar gas

Aunque el código sea idéntico, el gas puede depender del estado.

Por ejemplo:

```text
Network A
storage X = 0
```

```text
Network B
storage X = 500
```

La misma llamada podría recorrer caminos diferentes.

Por eso no debemos asumir que:

```text
mismo contrato
=
siempre exactamente mismo gas
```

---

# 112. Network configuration en una dApp

Una dApp debe saber qué red necesita.

Por ejemplo:

```text
Nuestro DEX
↓
requiere Base
```

Si el usuario está conectado a:

```text
Ethereum Mainnet
```

el frontend puede solicitar:

```text
Switch Network
```

---

# 113. Network mismatch

Uno de los errores más frecuentes de una dApp es:

```text
Wrong Network
```

Conceptualmente:

```text
DApp espera:
chainId = X

Wallet:
chainId = Y

X ≠ Y
↓
Wrong Network
```

---

# 114. El frontend debe verificar la red

Antes de enviar una transacción podemos comprobar:

```text
current chainId
```

y compararlo con:

```text
required chainId
```

Esto evita muchos errores.

---

# 115. Contratos por red

Una aplicación real puede mantener algo parecido a:

```text
deployments
│
├── 1
│   └── Counter → 0xAAA
│
├── 11155111
│   └── Counter → 0xBBB
│
└── 31337
    └── Counter → 0xCCC
```

donde la clave representa el:

```text
chainId
```

---

# 116. No hardcodear sin contexto

Esto:

```javascript
const contractAddress = "0xABC...";
```

puede ser insuficiente.

Una arquitectura más robusta necesita considerar:

```text
chainId
↓
contract address
```

porque cada red puede tener una dirección diferente.

---

# 117. RPC como dependencia de infraestructura

Aunque Ethereum sea descentralizado, una dApp puede estar utilizando:

```text
un solo proveedor RPC
```

Si ese proveedor falla:

```text
frontend
↓
no puede consultar blockchain
```

aunque Ethereum continúe funcionando perfectamente.

---

# 118. Descentralización de blockchain ≠ frontend sin dependencias

Una arquitectura podría ser:

```text
Ethereum
↓
descentralizado
```

pero:

```text
Frontend
↓
1 RPC provider
↓
1 servidor
↓
1 dominio
```

puede seguir teniendo puntos centralizados.

Esto será importante cuando construyamos dApps completas.

---

# 119. RPC de confianza

Cuando utilizamos un RPC estamos dependiendo de ese nodo o proveedor para obtener información.

Por eso aplicaciones sensibles pueden:

* utilizar varios proveedores;
* ejecutar nodos propios;
* verificar ciertos datos;
* implementar fallback RPCs.

Esto es más avanzado, pero conviene conocerlo desde el principio.

---

# 120. La red local también tiene RPC

Hardhat puede exponer un endpoint local.

Conceptualmente:

```text
http://127.0.0.1:...
```

Entonces:

```text
Frontend
↓
Local RPC
↓
Hardhat Network
```

Esto permite conectar nuestro frontend a contratos locales.

---

# 121. Desarrollo Full Stack

Más adelante podremos tener:

```text
React / Next.js
      ↓
ethers
      ↓
MetaMask
      ↓
Hardhat Local Network
      ↓
Smart Contract
```

Después cambiamos solamente el entorno:

```text
React / Next.js
      ↓
ethers
      ↓
MetaMask
      ↓
Sepolia
      ↓
Smart Contract
```

Y finalmente podríamos utilizar:

```text
Mainnet / L2
```

---

# 122. Modelo completo de redes

```text
                         Nuestro código
                              │
                           Hardhat
                              │
              ┌───────────────┼───────────────┐
              │               │               │
            Local          Testnet          Mainnet
              │               │               │
          Fake ETH        Test ETH         Real ETH
              │               │               │
           Testing        Staging         Production
```

---

# 123. Añadiendo Layer 2

En aplicaciones modernas el modelo puede ser:

```text
                         Nuestro código
                              │
                           Hardhat
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
        Local              Testnet            Production
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                              Ethereum L1                  L2
```

---

# 124. Modelo RPC

```text
Developer / DApp
      ↓
Provider
      ↓
RPC URL
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

# 125. Modelo de identidad

Para identificar dónde estamos trabajando:

```text
Network
↓
chainId
```

Para identificar una cuenta o contrato:

```text
Address
↓
0x...
```

Para identificar una transacción:

```text
Transaction Hash
↓
0x...
```

Por tanto siempre debemos mantener el contexto de:

```text
Network
```

---

# 126. Ejemplo completo

Supongamos que creamos:

```solidity
contract Counter {

    uint256 public count;

    function increment() external {
        count++;
    }

}
```

Primero:

```text
Counter.sol
↓
Hardhat compile
```

Después:

```text
Hardhat Local
↓
Deploy
↓
0xAAA
```

Probamos:

```text
increment()
↓
count = 1
```

Todo funciona.

---

# 127. Paso a Testnet

Después configuramos:

```text
Sepolia RPC
```

Tenemos:

```text
Test ETH
```

Ejecutamos:

```text
Hardhat
↓
Sepolia
↓
Deploy Counter
```

Obtenemos:

```text
0xBBB
```

Ahora:

```text
Sepolia
↓
0xBBB
↓
Counter
```

es accesible públicamente.

---

# 128. El contrato local sigue siendo diferente

Tenemos:

```text
Local
0xAAA
count = 15
```

y:

```text
Sepolia
0xBBB
count = 0
```

Aunque ambos fueron creados con:

```text
Counter.sol
```

son contratos independientes.

---

# 129. Paso a producción

Después de:

```text
Tests

Security Review

Testnet Validation
```

podríamos desplegar en producción.

Por ejemplo:

```text
Ethereum Mainnet
```

o una:

```text
Layer 2
```

dependiendo de los requisitos de la aplicación.

---

# 130. Elegir una red

No existe una única respuesta para:

```text
¿Qué red debo utilizar?
```

Depende de factores como:

* seguridad;
* costes;
* liquidez;
* usuarios;
* infraestructura;
* compatibilidad;
* herramientas;
* velocidad;
* ecosistema;
* descentralización;
* necesidades de la aplicación.

---

# 131. Para aprender

Para este recorrido una estrategia lógica será:

```text
1. Hardhat local
```

para desarrollo rápido.

```text
2. Testnet
```

para deployment público de pruebas.

```text
3. Mainnet / L2
```

cuando comprendamos deployment, testing y seguridad.

---

# 132. Nunca pruebes primero con dinero real

No hagas:

```text
Escribir contrato
↓
Deploy Mainnet
↓
"veamos si funciona"
```

Nuestro flujo debe ser:

```text
Escribir
↓
Compilar
↓
Testear
↓
Local
↓
Testnet
↓
Auditar / revisar
↓
Producción
```

---

# 133. Checklist antes de una transacción importante

Antes de desplegar o ejecutar una operación importante conviene comprobar:

```text
¿Qué network estoy usando?

¿Cuál es el chainId?

¿Qué cuenta está firmando?

¿Cuál es el balance?

¿Es test ETH o ETH real?

¿El RPC es correcto?

¿La dirección del contrato corresponde a esta red?

¿He probado antes la operación?
```

Este hábito evita muchos errores.

---

# 134. Errores comunes

## Error 1

```text
"Mi wallet muestra 0 ETH. Perdí mis fondos."
```

Tal vez simplemente estás conectado a otra red.

---

## Error 2

```text
"El contrato no existe."
```

Tal vez tienes la dirección correcta pero estás conectado a la red incorrecta.

---

## Error 3

```text
"Tengo test ETH, puedo usarlo en Mainnet."
```

No.

```text
Test ETH
≠
Mainnet ETH
```

---

## Error 4

```text
"Cambiar de red mueve mis tokens."
```

No.

```text
Switch Network
≠
Bridge
```

---

## Error 5

```text
"Todas las EVM chains son Ethereum L2."
```

No.

```text
EVM-compatible
≠
Layer 2
```

---

## Error 6

```text
"Todas las L2 tienen exactamente la seguridad de Mainnet."
```

No necesariamente.

Cada arquitectura tiene diferentes:

```text
trust assumptions

upgrade mechanisms

security properties
```

---

## Error 7

```text
"USDC es USDC porque el símbolo dice USDC."
```

No.

Debemos verificar:

```text
network
+
contract address
```

---

## Error 8

```text
"Un Mainnet Fork modifica Mainnet."
```

No.

El fork es:

```text
entorno local
```

aunque copie estado de Mainnet.

---

# 135. Conceptos que debes recordar

### Network

Blockchain específica donde estamos operando.

### Mainnet

Red principal de producción de Ethereum.

### Testnet

Red pública utilizada para pruebas.

### Local Network

Blockchain de desarrollo ejecutada localmente.

### Chain ID

Identificador de una red.

### RPC

Interfaz mediante la cual aplicaciones se comunican con nodos.

### RPC URL

Endpoint utilizado para conectarnos a un nodo.

### Provider

Abstracción de conexión hacia una blockchain.

### Block Explorer

Aplicación para explorar datos públicos de una red.

### Faucet

Servicio que proporciona tokens de prueba.

### Layer 1

Blockchain base.

### Layer 2

Sistema/red de escalado construida sobre una L1.

### EVM-compatible network

Red capaz de ejecutar contratos mediante un entorno compatible con EVM.

### Sidechain

Blockchain independiente conectada con otra mediante mecanismos como bridges.

### Bridge

Sistema utilizado para transferir o representar activos/mensajes entre redes.

### Fork

Copia local de un estado blockchain utilizada para desarrollo.

---

# 136. Diferencias fundamentales

```text
Mainnet
↓
producción
↓
ETH real
```

```text
Testnet
↓
pruebas públicas
↓
test ETH
```

```text
Local
↓
desarrollo
↓
ETH ficticio
```

```text
L2
↓
escalabilidad
↓
relación con Ethereum
```

---

# 137. Preguntas de repaso

Intenta responder estas preguntas antes de continuar.

1. ¿Qué es una red Ethereum?
2. ¿Qué diferencia existe entre Mainnet y una testnet?
3. ¿Qué significa `chainId`?
4. ¿Cuál es el chain ID de Ethereum Mainnet?
5. ¿Una dirección tiene necesariamente el mismo balance en todas las redes?
6. ¿Un contrato desplegado en Sepolia existe automáticamente en Mainnet?
7. ¿Qué es test ETH?
8. ¿Qué es un faucet?
9. ¿Qué es una red local?
10. ¿Por qué Hardhat utiliza redes locales?
11. ¿Qué significa RPC?
12. ¿Qué es un RPC URL?
13. ¿Qué es un provider?
14. ¿Qué diferencia existe entre provider y signer?
15. ¿Qué es un block explorer?
16. ¿Por qué necesitamos conocer red + dirección de un contrato?
17. ¿Qué es una Layer 1?
18. ¿Qué es una Layer 2?
19. ¿EVM-compatible significa automáticamente Layer 2?
20. ¿Qué es una sidechain?
21. ¿Qué es un bridge?
22. ¿Cambiar de red mueve nuestros tokens?
23. ¿Qué es un Mainnet fork?
24. ¿Un Mainnet fork modifica Mainnet real?
25. ¿Por qué deberíamos probar localmente antes de utilizar una testnet?
26. ¿Por qué deberíamos utilizar una testnet antes de Mainnet?
27. ¿Por qué no debemos reutilizar irresponsablemente cuentas de producción?
28. ¿Por qué el símbolo de un token no demuestra que sea legítimo?
29. ¿Puede una misma address contener contratos diferentes en distintas redes?
30. ¿Por qué una dApp debe verificar el `chainId`?

---

# 138. Lo que todavía NO necesitas dominar

Todavía no necesitas comprender en profundidad:

```text
Optimistic Rollup internals

Fraud proofs

Validity proofs

ZK proofs

Sequencers

Provers

Data Availability

Blobspace

Cross-chain messaging

Canonical bridges

Shared sequencing

Based rollups

Finality internals

Consensus clients

Execution clients

Multi-client architecture

RPC load balancing

Archive nodes

Light clients
```

Todos esos conceptos tendrán mucho más sentido después de trabajar realmente con contratos.

---

# 139. Mapa mental

```text
                         BLOCKCHAIN NETWORKS
                                │
               ┌────────────────┼────────────────┐
               │                │                │
            Mainnet          Testnet           Local
               │                │                │
            Real ETH         Test ETH        Fake ETH
               │                │                │
          Production          Testing        Development
```

Añadiendo escalabilidad:

```text
                         Ethereum
                            │
                         Layer 1
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             L2             L2             L2
```

---

# 140. Mapa mental del desarrollador

```text
                      Developer
                          │
                       Hardhat
                          │
                       Provider
                          │
                         RPC
                          │
                         Node
                          │
                        Network
                          │
                         EVM
                          │
                    Smart Contract
```

---

# 141. Información necesaria para interactuar

Para interactuar correctamente con un contrato normalmente necesitamos conocer:

```text
Network
   ↓
Chain ID

RPC
   ↓
Connection

Contract Address
   ↓
Location

ABI
   ↓
Interface

Signer
   ↓
Authorization
```

Esto será fundamental cuando lleguemos a Hardhat.

---

# 142. Flujo de aprendizaje

Durante este repositorio avanzaremos así:

```text
Solidity
↓
Contract
↓
Compile
↓
Local Network
↓
Tests
↓
Sepolia
↓
Frontend
↓
Security Review
↓
Production Network
```

Y más adelante podremos hacer:

```text
Mainnet Fork
↓
DeFi Protocol
↓
Integration Tests
```

---

# 143. Regla mental fundamental

Cada vez que veas:

```text
0x...
```

pregúntate:

```text
¿En qué red?
```

Cada vez que veas:

```text
transaction
```

pregúntate:

```text
¿En qué red?
```

Cada vez que veas:

```text
token
```

pregúntate:

```text
¿En qué red y qué contrato?
```

Cada vez que hagas:

```text
deploy
```

pregúntate:

```text
¿En qué red estoy a punto de gastar gas?
```

Ese hábito es extremadamente importante en blockchain.

---

# 144. Siguiente paso

Ya entendemos:

```text
Ethereum
↓
qué es la blockchain
```

```text
EVM
↓
dónde se ejecutan contratos
```

```text
Gas
↓
cómo se mide el trabajo
```

```text
Networks
↓
dónde existe ese estado
```

Todavía necesitamos comprender en detalle el objeto que provoca cambios en ese estado:

```text
Transaction
```

Por eso uno de los siguientes archivos fundamentales será:

```text
transacciones.md
```

donde estudiaremos:

* `from`;
* `to`;
* `value`;
* `data`;
* `nonce`;
* `chainId`;
* gas;
* firmas;
* transaction hash;
* mempool;
* bloques;
* receipts;
* confirmations;
* success;
* revert;
* replacement transactions.

---

# Resumen

Una red es una blockchain independiente con su propio:

```text
Estado

Balances

Contratos

Bloques

Transacciones

Chain ID
```

Durante desarrollo utilizaremos principalmente:

```text
Local
↓
desarrollo y testing
```

```text
Testnet
↓
pruebas públicas
```

```text
Mainnet / L2
↓
producción
```

Para conectarnos utilizamos:

```text
Application
↓
Provider
↓
RPC
↓
Node
↓
Network
```

Y siempre debemos recordar:

```text
misma address
≠
mismo estado
```

```text
mismo contrato Solidity
≠
mismo deployment
```

```text
switch network
≠
bridge assets
```

```text
EVM-compatible
≠
Ethereum Layer 2
```

El modelo completo hasta ahora queda:

```text
Usuario
   ↓
Wallet
   ↓
Transaction
   ↓
Network
   ↓
Node
   ↓
EVM
   ↓
Smart Contract
   ↓
Gas
   ↓
Nuevo Estado
```

Comprender este flujo hará que configurar redes en Hardhat más adelante sea mucho más sencillo.
