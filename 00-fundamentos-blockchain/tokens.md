# Tokens en Ethereum

Uno de los conceptos más importantes del ecosistema blockchain es:

```text
Token
```

Los tokens permiten representar activos digitales dentro de una blockchain.

Por ejemplo, un token puede representar:

* una moneda;
* puntos;
* acciones;
* derechos;
* acceso;
* gobernanza;
* objetos de un juego;
* activos financieros;
* coleccionables;
* NFTs.

En Ethereum, muchos tokens existen gracias a:

```text
Smart Contracts
```

Podemos pensar:

```text
Ethereum
   ↓
Smart Contract
   ↓
Token
```

---

# 1. ¿Qué es un token?

Un token es una representación digital de valor, propiedad o derechos dentro de una blockchain.

Por ejemplo:

```text
100 TOKEN
```

pueden representar:

```text
100 unidades de un activo digital
```

Pero el significado exacto depende de las reglas del smart contract.

Un token puede representar algo financiero:

```text
USD
```

algo virtual:

```text
Game Coin
```

o algo único:

```text
NFT #152
```

---

# 2. Un token no es necesariamente una criptomoneda independiente

Cuando escuchamos:

```text
Token
```

podemos pensar inmediatamente en una criptomoneda.

Pero muchos tokens no tienen su propia blockchain.

Por ejemplo:

```text
Token ERC-20
      ↓
Smart Contract
      ↓
Ethereum
```

El token depende de Ethereum para:

* ejecución;
* almacenamiento;
* transacciones;
* seguridad;
* gas.

---

# 3. ETH vs Token

Este punto es fundamental.

ETH es:

```text
el activo nativo de Ethereum
```

Mientras muchos tokens son:

```text
smart contracts desplegados en Ethereum
```

Por tanto:

```text
ETH
≠
ERC-20
```

---

# 4. ETH es nativo

ETH existe como parte del protocolo Ethereum.

No existe un contrato ERC-20 principal que diga:

```solidity
mapping(address => uint256) balances;
```

para mantener todos los balances de ETH.

Ethereum mantiene los balances de ETH como parte del estado de las cuentas.

Conceptualmente:

```text
Ethereum Protocol
      ↓
ETH balances
```

---

# 5. Un token puede ser un smart contract

Supongamos que creamos:

```text
MYTOKEN
```

Podríamos tener conceptualmente:

```solidity
contract MyToken {

    mapping(address => uint256) balances;

}
```

Entonces el contrato podría guardar algo parecido a:

```text
Alice → 100

Bob → 50

Carol → 300
```

El token no necesita crear una nueva blockchain.

Existe dentro de:

```text
Ethereum
```

---

# 6. El balance de un token vive en el contrato

Supongamos que Alice posee:

```text
100 TOKEN
```

Esto normalmente significa que dentro del estado del contrato existe información equivalente a:

```text
balances[Alice] = 100
```

No significa que existan literalmente 100 objetos digitales almacenados dentro de la wallet de Alice.

La blockchain contiene el estado.

La wallet simplemente lo consulta.

---

# 7. La wallet no guarda los tokens

Este es un error común.

Una wallet no almacena físicamente:

```text
ETH

USDC

NFTs

Tokens
```

Los activos existen dentro del estado de las blockchains.

La wallet administra:

```text
Private Keys
```

y utiliza esas claves para controlar cuentas.

Conceptualmente:

```text
Blockchain
↓
Balances / Ownership
```

```text
Wallet
↓
Keys
```

---

# 8. Tokens fungibles

Un activo es:

```text
fungible
```

cuando cada unidad es intercambiable por otra unidad equivalente.

Ejemplo:

```text
1 TOKEN
=
1 TOKEN
```

Si Alice tiene:

```text
10 TOKEN
```

y Bob tiene:

```text
10 TOKEN
```

ambos tienen la misma cantidad del mismo activo.

---

# 9. Ejemplo de fungibilidad

Piensa en monedas.

En términos normales:

```text
$1
=
otro $1
```

No nos importa exactamente cuál unidad física recibimos si su valor y características son equivalentes.

En blockchain podemos representar esta idea mediante tokens fungibles.

El estándar más conocido en Ethereum es:

```text
ERC-20
```

---

# 10. Tokens no fungibles

Un token:

```text
non-fungible
```

representa una unidad individual que puede ser diferente de otra.

Ejemplo:

```text
NFT #1
≠
NFT #2
```

Aunque ambos pertenezcan al mismo contrato.

---

# 11. Ejemplo de NFT

Supongamos una colección:

```text
CryptoAnimals
```

Podemos tener:

```text
Token ID 1
↓
Dragon
```

```text
Token ID 2
↓
Cat
```

```text
Token ID 3
↓
Phoenix
```

Cada uno posee un identificador distinto.

---

# 12. Fungible vs Non-Fungible

```text
FUNGIBLE

1 TOKEN
=
1 TOKEN
```

Mientras:

```text
NON-FUNGIBLE

NFT #1
≠
NFT #2
```

Podemos resumir:

```text
ERC-20
↓
cantidades
```

```text
ERC-721
↓
propiedad de IDs únicos
```

---

# 13. ¿Qué es ERC?

ERC significa:

```text
Ethereum Request for Comments
```

Los ERC pueden definir estándares utilizados por aplicaciones y smart contracts.

Esto permite que diferentes herramientas sepan cómo interactuar con contratos que siguen determinadas interfaces.

---

# 14. ¿Por qué necesitamos estándares?

Imaginemos que cada desarrollador crea tokens utilizando funciones diferentes.

Token A:

```solidity
sendMoney()
```

Token B:

```solidity
moveCoins()
```

Token C:

```solidity
giveTokens()
```

Las wallets y exchanges tendrían que implementar lógica diferente para cada token.

Esto sería muy complicado.

---

# 15. Con un estándar

Si todos implementan:

```solidity
transfer()
```

una aplicación puede conocer de antemano cómo interactuar con ellos.

Conceptualmente:

```text
Wallet
   ↓
ERC Standard
   ↓
Token A
Token B
Token C
```

Los estándares permiten:

```text
interoperabilidad
```

---

# 16. ERC-20

ERC-20 es uno de los estándares más importantes de Ethereum.

Define una interfaz común para:

```text
tokens fungibles
```

Ejemplos de conceptos que aparecen en ERC-20:

```text
totalSupply

balanceOf

transfer

approve

allowance

transferFrom
```

---

# 17. Ejemplo conceptual ERC-20

Supongamos:

```text
Token: DEV
```

Existe un contrato:

```text
DEVToken
```

Estado:

```text
Alice → 100 DEV

Bob → 20 DEV

Carol → 0 DEV
```

Alice quiere enviar:

```text
25 DEV
```

a Carol.

---

# 18. Transferencia de tokens

Alice ejecuta:

```solidity
transfer(Carol, 25);
```

Antes:

```text
Alice → 100

Carol → 0
```

Después:

```text
Alice → 75

Carol → 25
```

El contrato actualiza sus balances.

---

# 19. No se mueve ETH

Cuando realizamos:

```solidity
token.transfer(bob, 100);
```

normalmente estamos modificando el estado de:

```text
Token Contract
```

No estamos enviando:

```text
100 ETH
```

Estamos moviendo:

```text
100 unidades del token
```

---

# 20. ¿Quién paga el gas?

Aunque estemos transfiriendo un token ERC-20, seguimos ejecutando una transacción en Ethereum.

Por tanto necesitamos:

```text
ETH
```

para pagar el gas.

Ejemplo:

```text
Alice

1000 TOKEN
0 ETH
```

Alice tiene tokens.

Pero puede no ser capaz de ejecutar:

```text
transfer()
```

porque necesita ETH para pagar la transacción.

---

# 21. Token balance vs ETH balance

Una dirección puede tener:

```text
ETH Balance
```

y además:

```text
Token A Balance

Token B Balance

Token C Balance
```

Ejemplo:

```text
Alice

ETH       → 2

USDC      → 500

TOKEN     → 1000
```

Cada balance pertenece a sistemas diferentes.

---

# 22. `balanceOf`

Un token ERC-20 normalmente permite consultar:

```solidity
balanceOf(address)
```

Ejemplo:

```solidity
token.balanceOf(alice);
```

podría devolver:

```text
100
```

Conceptualmente:

```text
Token Contract
↓
balances[Alice]
↓
100
```

---

# 23. `totalSupply`

Otro concepto importante es:

```text
total supply
```

Representa la cantidad total de unidades existentes del token.

Ejemplo:

```text
Alice → 100

Bob → 200

Carol → 700
```

Entonces conceptualmente:

```text
totalSupply = 1000
```

---

# 24. Supply

`Supply` significa:

```text
cantidad de tokens existentes
```

Dependiendo del contrato puede ser:

```text
Fixed Supply
```

o:

```text
Variable Supply
```

---

# 25. Fixed Supply

Un token puede crear todas sus unidades al inicio.

Por ejemplo:

```text
1,000,000 TOKEN
```

y nunca permitir crear más.

Conceptualmente:

```text
Deploy
↓
Mint 1,000,000
↓
No more minting
```

---

# 26. Variable Supply

Otro contrato puede permitir crear nuevos tokens.

Conceptualmente:

```text
Initial supply
↓
1,000 TOKEN

Later
↓
Mint 500

New Supply
↓
1,500 TOKEN
```

Esto depende completamente de las reglas del contrato.

---

# 27. Mint

`Mint` significa:

```text
crear nuevos tokens
```

Por ejemplo:

```text
totalSupply = 1000
```

Ejecutamos:

```text
mint Alice 100
```

Después:

```text
totalSupply = 1100
```

y:

```text
Alice balance += 100
```

---

# 28. Burn

`Burn` significa:

```text
destruir tokens
```

Ejemplo:

```text
totalSupply = 1000
```

Burn:

```text
100
```

Después:

```text
totalSupply = 900
```

---

# 29. Mint y Burn no son magia

Estas operaciones simplemente modifican el estado del contrato según sus reglas.

Conceptualmente:

```text
Mint
↓
increase balance
+
increase supply
```

```text
Burn
↓
decrease balance
+
decrease supply
```

---

# 30. ¿Quién puede hacer mint?

Depende del contrato.

Puede ser:

```text
nadie
```

```text
owner
```

```text
governance
```

```text
otro smart contract
```

```text
cualquier usuario bajo ciertas reglas
```

Esto es muy importante.

Antes de confiar en un token debemos entender:

```text
¿quién puede crear nuevas unidades?
```

---

# 31. Token inflation

Si un contrato permite crear tokens indefinidamente:

```text
Mint
Mint
Mint
Mint
```

el supply puede aumentar.

Esto puede producir:

```text
inflation
```

según el modelo económico del token.

---

# 32. Maximum Supply

Algunos tokens pueden definir un:

```text
max supply
```

Por ejemplo:

```text
Maximum Supply
=
21,000,000 TOKEN
```

Entonces el contrato puede impedir superar esa cantidad.

---

# 33. Circulating Supply

También podemos encontrar:

```text
circulating supply
```

que intenta representar cuánto del supply se encuentra efectivamente circulando.

No es necesariamente lo mismo que:

```text
totalSupply
```

porque pueden existir tokens:

* bloqueados;
* vesting;
* treasury;
* contratos;
* direcciones especiales.

---

# 34. Token Name

Un ERC-20 suele incluir un nombre.

Ejemplo:

```text
Developer Token
```

Esto es información descriptiva.

No identifica de manera segura el contrato.

---

# 35. Token Symbol

También puede tener un símbolo:

```text
DEV
```

Pero cualquiera puede desplegar otro token llamado:

```text
DEV
```

Por tanto:

```text
symbol
≠
identidad única
```

---

# 36. La identidad real del token

Para identificar un token debemos considerar:

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

Esto es mucho más importante que:

```text
Name
+
Symbol
```

---

# 37. Tokens falsos

Cualquiera puede crear:

```text
USD Coin
```

con símbolo:

```text
USDC
```

Eso no significa que sea el USDC legítimo.

Por eso nunca debemos confiar únicamente en:

```text
name

symbol

logo
```

Debemos verificar:

```text
network

contract address

official source
```

---

# 38. Decimals

Los tokens ERC-20 suelen utilizar un concepto llamado:

```text
decimals
```

Permite representar unidades fraccionarias.

Ejemplo:

```text
decimals = 18
```

significa que:

```text
1 TOKEN
```

puede representarse internamente como:

```text
1 × 10^18
```

unidades mínimas.

---

# 39. ¿Por qué existen decimals?

La EVM trabaja principalmente con:

```text
integers
```

No utilizamos directamente números decimales de punto flotante como:

```text
1.25
```

dentro de Solidity.

En su lugar representamos cantidades utilizando enteros.

---

# 40. Ejemplo

Supongamos:

```text
decimals = 18
```

Entonces:

```text
1 TOKEN
=
1,000,000,000,000,000,000
```

unidades internas.

También:

```text
0.5 TOKEN
```

puede representarse como:

```text
500,000,000,000,000,000
```

unidades internas.

---

# 41. Decimals no siempre es 18

Muchos tokens utilizan:

```text
18 decimals
```

pero no todos.

Un token puede utilizar:

```text
6 decimals
```

por ejemplo.

Por eso una aplicación no debería asumir ciegamente:

```text
todos los tokens = 18 decimals
```

---

# 42. Decimals no crea precisión infinita

Si un token utiliza:

```text
6 decimals
```

la unidad mínima representable es:

```text
0.000001 TOKEN
```

No podemos representar una cantidad menor utilizando el sistema normal de unidades del token.

---

# 43. Decimals es presentación

Una idea mental útil:

```text
Blockchain
↓
integers
```

Mientras:

```text
Wallet / Frontend
↓
formatea decimals
```

Ejemplo interno:

```text
1000000
```

con:

```text
decimals = 6
```

puede mostrarse como:

```text
1.0 TOKEN
```

---

# 44. Allowance

ERC-20 introduce un concepto muy importante:

```text
allowance
```

Permite autorizar a otra dirección para gastar una cantidad determinada de nuestros tokens.

---

# 45. ¿Por qué necesitamos allowances?

Supongamos que Alice quiere utilizar un DEX.

Alice tiene:

```text
1000 TOKEN
```

El DEX necesita mover:

```text
100 TOKEN
```

desde Alice hacia un pool.

Pero el DEX no tiene la private key de Alice.

Entonces necesitamos un mecanismo de autorización.

---

# 46. Approve

Alice puede ejecutar:

```solidity
approve(spender, amount);
```

Por ejemplo:

```text
Alice
↓
approve
↓
DEX
↓
100 TOKEN
```

Esto significa conceptualmente:

> Permito que este contrato pueda gastar hasta 100 tokens desde mi balance.

---

# 47. `approve`

Ejemplo:

```solidity
token.approve(dex, 100);
```

Podemos imaginar:

```text
allowance[Alice][DEX]
=
100
```

---

# 48. `allowance`

Podemos consultar cuánto puede gastar una dirección.

Conceptualmente:

```solidity
allowance(owner, spender)
```

Por ejemplo:

```text
owner = Alice

spender = DEX
```

Resultado:

```text
100 TOKEN
```

---

# 49. `transferFrom`

Una vez existe autorización, el spender puede utilizar:

```solidity
transferFrom()
```

Ejemplo:

```text
Alice
↓
approved DEX
↓
DEX calls transferFrom
↓
100 TOKEN
↓
Pool
```

---

# 50. Flujo completo de Approval

```text
Alice
↓
approve(DEX, 100)
↓
Token Contract
↓
allowance = 100
```

Después:

```text
DEX
↓
transferFrom(
    Alice,
    Pool,
    100
)
↓
Token Contract
↓
move tokens
```

---

# 51. Approve no transfiere tokens

Esto es fundamental.

Cuando hacemos:

```solidity
approve(dex, 100);
```

no significa:

```text
enviar 100 tokens al DEX
```

Significa:

```text
autorizar hasta 100
```

La transferencia ocurre posteriormente mediante:

```text
transferFrom
```

---

# 52. Approval también consume gas

`approve()` modifica estado.

Por tanto:

```text
approve
↓
transaction
↓
gas
```

Después:

```text
swap
↓
otra transaction
↓
gas
```

Por eso algunos protocolos requieren inicialmente:

```text
Approve
```

y después:

```text
Swap
```

---

# 53. Infinite Approval

Algunas aplicaciones solicitan una autorización muy grande.

Conceptualmente:

```text
approve(
    DEX,
    maximum possible amount
)
```

Esto evita tener que aprobar antes de cada operación.

Pero introduce riesgos.

---

# 54. Riesgo de approvals

Supongamos:

```text
Alice
↓
infinite approval
↓
Malicious Contract
```

Si ese contrato puede utilizar:

```text
transferFrom
```

podría intentar retirar una gran cantidad de tokens.

Por eso:

```text
Approval
=
permission
```

y debe tratarse como una autorización importante.

---

# 55. Revocar approvals

Una autorización puede normalmente modificarse.

Por ejemplo:

```text
allowance = 1000
```

podemos reducirla a:

```text
0
```

Conceptualmente:

```text
revoke approval
```

Esto puede ser útil cuando ya no confiamos o necesitamos determinada aplicación.

---

# 56. ERC-20 básico

Un token ERC-20 incluye conceptos como:

```text
name
symbol
decimals
totalSupply
balanceOf
transfer
approve
allowance
transferFrom
```

Más adelante construiremos tokens reales en:

```text
08-erc20/
```

---

# 57. ERC-721

ERC-721 es uno de los estándares utilizados para:

```text
NFTs
```

En lugar de preguntar:

```text
¿Cuántos tokens tiene Alice?
```

una pregunta importante es:

```text
¿Quién es dueño del tokenId X?
```

---

# 58. Token ID

Cada NFT tiene normalmente un identificador:

```text
tokenId
```

Ejemplo:

```text
tokenId = 1
```

```text
tokenId = 2
```

```text
tokenId = 3
```

Cada uno representa una unidad distinta.

---

# 59. Ownership

Un contrato ERC-721 mantiene información equivalente a:

```text
tokenId 1
↓
Alice
```

```text
tokenId 2
↓
Bob
```

```text
tokenId 3
↓
Alice
```

---

# 60. `ownerOf`

ERC-721 permite consultar quién posee determinado NFT.

Conceptualmente:

```solidity
ownerOf(1);
```

podría devolver:

```text
Alice
```

---

# 61. `balanceOf` en ERC-721

También existe:

```solidity
balanceOf(address)
```

pero significa algo diferente al ERC-20.

En ERC-721 puede indicarnos:

```text
cuántos NFTs posee una dirección
```

No cuáles exactamente.

---

# 62. NFT Transfer

Alice puede transferir:

```text
NFT #25
```

a Bob.

Antes:

```text
ownerOf(25)
=
Alice
```

Después:

```text
ownerOf(25)
=
Bob
```

---

# 63. NFT Metadata

Un NFT puede estar relacionado con metadata.

Por ejemplo:

```json
{
  "name": "Dragon #25",
  "description": "Legendary Dragon",
  "image": "...",
  "attributes": []
}
```

Esta metadata puede encontrarse:

```text
on-chain
```

o:

```text
off-chain
```

dependiendo del diseño.

---

# 64. NFT no significa imagen

Un error común:

```text
NFT = imagen
```

No necesariamente.

El NFT es:

```text
token
```

La imagen puede ser:

```text
metadata relacionada
```

El token puede representar:

* arte;
* propiedad;
* membresía;
* entrada;
* objeto de juego;
* certificado;
* identidad;
* derecho.

---

# 65. Token URI

Muchos NFTs utilizan una:

```text
tokenURI
```

que permite localizar metadata.

Conceptualmente:

```text
NFT #25
↓
tokenURI
↓
Metadata
↓
Image / Attributes
```

---

# 66. ERC-1155

Otro estándar importante es:

```text
ERC-1155
```

Permite manejar múltiples tipos de tokens dentro de un mismo contrato.

Puede representar:

```text
fungible tokens
```

y:

```text
non-fungible / semi-fungible assets
```

dependiendo del diseño.

---

# 67. Ejemplo ERC-1155

Imaginemos un juego.

Dentro de un único contrato:

```text
ID 1
↓
Gold Coins
```

```text
ID 2
↓
Health Potions
```

```text
ID 3
↓
Legendary Sword
```

Cada ID puede tener reglas y cantidades diferentes.

---

# 68. ERC-20 vs ERC-721 vs ERC-1155

```text
ERC-20
↓
fungible tokens
```

```text
ERC-721
↓
unique NFTs
```

```text
ERC-1155
↓
multiple token types
```

---

# 69. Stablecoins

Una:

```text
stablecoin
```

es un token diseñado para intentar mantener un valor estable respecto a algún activo o referencia.

Por ejemplo:

```text
1 token
≈
1 USD
```

dependiendo del diseño.

---

# 70. No todas las stablecoins funcionan igual

Pueden existir diferentes modelos:

```text
fiat-backed
```

```text
crypto-backed
```

```text
algorithmic
```

u otros diseños.

Cada modelo introduce diferentes riesgos.

---

# 71. Stable no significa sin riesgo

El nombre:

```text
stablecoin
```

no garantiza que el precio siempre será exactamente estable.

Existen riesgos como:

* reservas;
* smart contracts;
* custodios;
* governance;
* liquidez;
* oráculos;
* depeg.

---

# 72. Governance Token

Un:

```text
governance token
```

puede dar derechos relacionados con decisiones de un protocolo.

Por ejemplo:

```text
Token Holder
↓
Vote
↓
Protocol Decision
```

El poder exacto depende del sistema.

---

# 73. Utility Token

Un:

```text
utility token
```

puede utilizarse para acceder a determinados servicios o funciones.

Ejemplo:

```text
Own TOKEN
↓
Access Feature
```

El término no define por sí solo las propiedades legales o económicas del activo.

---

# 74. Wrapped Tokens

También podemos encontrar:

```text
wrapped tokens
```

Un wrapped token representa otro activo mediante un smart contract o sistema relacionado.

Un ejemplo importante es:

```text
WETH
```

---

# 75. ¿Qué es WETH?

WETH significa:

```text
Wrapped Ether
```

Permite representar ETH mediante una interfaz compatible con tokens.

Conceptualmente:

```text
ETH
↓
Wrap
↓
WETH
```

---

# 76. ¿Por qué existe WETH?

ETH es el activo nativo.

Pero muchos protocolos esperan interactuar con:

```text
ERC-20
```

WETH permite tratar ETH mediante una interfaz de token compatible.

Conceptualmente:

```text
ETH
↓
wrap
↓
ERC-20-compatible representation
```

---

# 77. ETH vs WETH

```text
ETH
↓
native asset
```

```text
WETH
↓
token contract
```

Aunque normalmente existe una relación cercana de valor:

```text
1 ETH
↔
1 WETH
```

son técnicamente diferentes.

---

# 78. Wrap

Cuando hacemos:

```text
wrap ETH
```

conceptualmente:

```text
User
↓
sends ETH
↓
WETH Contract
↓
receives WETH
```

---

# 79. Unwrap

También podemos hacer:

```text
WETH
↓
unwrap
↓
ETH
```

Conceptualmente:

```text
burn / return WETH
↓
receive native ETH
```

según la lógica del contrato.

---

# 80. Tokens y redes

Un token existe en una red específica.

Por ejemplo:

```text
Token Contract
0xABC...
```

en:

```text
Ethereum Mainnet
```

no significa automáticamente que el mismo token exista en:

```text
Sepolia
```

---

# 81. Mismo símbolo, otra red

Podemos tener:

```text
Ethereum
USDC
```

y también un token con símbolo:

```text
USDC
```

en otra blockchain.

Pero debemos verificar:

```text
qué contrato representa realmente el activo
```

---

# 82. Tokens bridged

Cuando activos se utilizan en otras redes pueden existir representaciones mediante:

```text
bridges
```

Conceptualmente:

```text
Token on Network A
↓
Bridge
↓
Representation on Network B
```

El mecanismo exacto depende del bridge.

---

# 83. Un bridge agrega riesgo

Cuando utilizamos un token bridged debemos considerar riesgos adicionales:

```text
Bridge Contract

Validators

Multisig

Messaging Protocol

Smart Contract Bugs
```

Por eso:

```text
same symbol
≠
same risk
```

---

# 84. Token Contract Address

Para interactuar con un token necesitamos conocer su:

```text
contract address
```

Por ejemplo:

```text
Network
+
Token Contract Address
```

La dirección identifica el contrato dentro de esa red.

---

# 85. ABI del token

También necesitamos conocer su:

```text
ABI
```

Aunque para estándares conocidos podemos utilizar una interfaz estándar.

Por ejemplo:

```text
ERC-20 Interface
```

permite interactuar con cualquier contrato compatible.

---

# 86. Interoperabilidad

Una de las grandes ventajas de los estándares es que aplicaciones pueden trabajar con muchos tokens sin conocer su implementación interna.

Por ejemplo:

```text
DEX
```

puede interactuar con:

```text
Token A
Token B
Token C
```

utilizando interfaces ERC-20 compatibles.

---

# 87. Interface vs Implementation

Dos tokens pueden implementar:

```text
ERC-20
```

pero tener lógicas internas completamente distintas.

Token A:

```text
Fixed Supply
```

Token B:

```text
Mintable
```

Token C:

```text
Fee on Transfer
```

Token D:

```text
Pausable
```

Todos pueden exponer parte de una misma interfaz estándar.

---

# 88. Estándar no significa código idéntico

Esto:

```text
ERC-20 compatible
```

no significa:

```text
exactamente mismo código
```

Significa que implementa determinado comportamiento/interfaz requerida por el estándar.

---

# 89. Token Transfer Events

Los tokens suelen emitir eventos cuando ocurren transferencias.

Por ejemplo:

```solidity
event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
);
```

Esto permite que:

```text
Wallets

Explorers

Indexers

DApps
```

detecten actividad.

---

# 90. Evento `Transfer`

Conceptualmente:

```text
Alice
↓
transfer Bob 100
↓
Token Contract
↓
update balances
↓
emit Transfer
```

El evento queda registrado como log.

---

# 91. Tokens y exploradores

Un block explorer puede mostrar:

```text
Token Transfers

Holders

Supply

Contract

Transactions
```

porque procesa información del contrato y sus eventos.

---

# 92. Holder

Un:

```text
token holder
```

es una dirección que posee una cantidad de determinado token.

Ejemplo:

```text
Alice
↓
100 TOKEN
```

Alice es holder de ese token.

---

# 93. Holder no significa persona única

Una dirección puede pertenecer a:

```text
Person

Exchange

Smart Contract

DAO

Multisig

Bridge
```

Por tanto:

```text
1000 holders
```

no significa necesariamente:

```text
1000 personas
```

---

# 94. Token Transfer no siempre representa una compra

Si vemos:

```text
Alice → Bob
100 TOKEN
```

solo sabemos que ocurrió una transferencia según las reglas del contrato.

No sabemos automáticamente si fue:

* compra;
* regalo;
* pago;
* swap;
* bridge;
* contrato;
* distribución.

Necesitamos contexto.

---

# 95. Tokens y smart contract risk

Un token es código.

Por tanto puede contener:

```text
bugs

vulnerabilities

malicious logic

centralized permissions
```

No debemos asumir:

```text
token exists
=
token safe
```

---

# 96. Ejemplo de permiso peligroso

Supongamos que existe:

```solidity
function mint(
    address to,
    uint256 amount
)
    external
    onlyOwner
{
}
```

El owner puede crear tokens.

Eso puede ser intencional.

Pero como usuario debemos saberlo.

---

# 97. Pausable Tokens

Un contrato puede permitir:

```text
pause
```

Esto podría impedir temporalmente ciertas operaciones.

Conceptualmente:

```text
Admin
↓
pause
↓
Transfers disabled
```

Dependiendo del sistema, puede ser una característica de seguridad o un punto de centralización.

---

# 98. Blacklists

Algunos tokens pueden implementar mecanismos para impedir que determinadas direcciones transfieran.

Ejemplo conceptual:

```text
blacklisted[Alice] = true
```

Entonces:

```text
Alice
↓
transfer
↓
revert
```

Esto depende completamente del contrato.

---

# 99. Transfer Fees

Un token también podría cobrar una comisión al transferir.

Por ejemplo:

```text
Alice sends 100 TOKEN
```

Bob recibe:

```text
98 TOKEN
```

y:

```text
2 TOKEN
```

se utilizan según la lógica del token.

Estos tokens pueden causar problemas en protocolos que esperan transferencias estándar.

---

# 100. Rebasing Tokens

Existen tokens donde los balances pueden cambiar según determinadas reglas sin una transferencia tradicional entre usuarios.

Esto se conoce en algunos diseños como:

```text
rebasing
```

Es un concepto avanzado.

Por ahora basta recordar:

```text
no todos los ERC-20 tienen comportamiento económico idéntico
```

---

# 101. Tokens con Hooks

Algunos estándares o extensiones permiten ejecutar lógica adicional durante transferencias u otras operaciones.

Esto introduce más funcionalidad, pero también:

```text
más complejidad
```

y potencialmente:

```text
más superficie de ataque
```

---

# 102. OpenZeppelin

Cuando creemos tokens no será recomendable implementar todos los estándares manualmente desde cero.

Utilizaremos:

```text
OpenZeppelin Contracts
```

que ofrece implementaciones ampliamente utilizadas de estándares como:

```text
ERC20

ERC721

ERC1155
```

Lo estudiaremos en:

```text
06-openzeppelin/
```

---

# 103. Luego construiremos ERC-20

Más adelante tendremos:

```text
08-erc20/
```

donde veremos en profundidad:

* implementación;
* balances;
* transfer;
* approvals;
* allowances;
* mint;
* burn;
* supply;
* decimals;
* security;
* extensions.

---

# 104. Luego construiremos ERC-721

También tendremos:

```text
09-erc721/
```

donde aprenderemos:

* NFTs;
* token IDs;
* ownership;
* mint;
* burn;
* transfers;
* approvals;
* metadata;
* tokenURI;
* collections.

---

# 105. Tokens en DeFi

Los tokens son fundamentales para:

```text
DeFi
```

Por ejemplo:

```text
Token A
+
Token B
↓
Liquidity Pool
```

o:

```text
Collateral Token
↓
Lending Protocol
↓
Borrow another token
```

---

# 106. DEX

Un:

```text
DEX
```

o decentralized exchange permite intercambiar activos mediante smart contracts.

Ejemplo:

```text
TOKEN A
↓
DEX
↓
TOKEN B
```

Esto depende en gran parte de estándares comunes como ERC-20.

---

# 107. Liquidity Pool

Un:

```text
liquidity pool
```

es un smart contract que mantiene determinados activos utilizados para operaciones financieras.

Ejemplo:

```text
Pool
│
├── TOKEN A
└── TOKEN B
```

---

# 108. Token Approval en DeFi

Cuando usamos un DEX normalmente ocurre:

```text
User
↓
approve Token
↓
DEX
```

Después:

```text
User
↓
swap
↓
DEX
↓
transferFrom
```

Por eso comprender allowances es fundamental antes de aprender DeFi.

---

# 109. Tokens y Oráculos

Algunos protocolos necesitan conocer:

```text
precio del token
```

Un smart contract no puede simplemente consultar:

```text
Google
```

Por eso pueden utilizar:

```text
Oracles
```

Conceptualmente:

```text
External Price Data
↓
Oracle
↓
Protocol
```

Lo estudiaremos en:

```text
11-oraculos/
```

---

# 110. Market Cap

En economía de tokens aparecerá frecuentemente:

```text
Market Capitalization
```

o:

```text
Market Cap
```

De manera simplificada suele calcularse como:

```text
Token Price
×
Circulating Supply
```

Pero este valor no significa que esa cantidad de dinero esté literalmente depositada dentro del token.

---

# 111. Fully Diluted Valuation

También podemos encontrar:

```text
FDV
```

o:

```text
Fully Diluted Valuation
```

que suele intentar representar una valoración considerando el supply máximo o completamente diluido.

Es un concepto económico, no una propiedad fundamental de la EVM.

---

# 112. Tokenomics

`Tokenomics` combina:

```text
Token
+
Economics
```

Describe reglas económicas como:

* supply;
* emisión;
* distribución;
* inflación;
* burns;
* incentives;
* vesting;
* governance.

---

# 113. Tokenomics no es Solidity

Solidity implementa reglas.

Pero diseñar una economía sostenible requiere:

```text
economics

game theory

incentives

security
```

Un contrato técnicamente correcto puede tener tokenomics muy malas.

---

# 114. Vesting

`Vesting` significa distribuir o desbloquear tokens progresivamente según reglas.

Ejemplo:

```text
1000 TOKEN
↓
12 months
↓
gradual unlock
```

Esto puede implementarse mediante smart contracts.

---

# 115. Airdrop

Un:

```text
airdrop
```

es una distribución de tokens a múltiples direcciones.

Ejemplo:

```text
Protocol
↓
Alice → 100 TOKEN
Bob → 50 TOKEN
Carol → 75 TOKEN
```

Los mecanismos pueden variar.

---

# 116. Snapshot

Un proyecto puede utilizar un:

```text
snapshot
```

para observar balances o estados en un bloque determinado.

Ejemplo:

```text
Block X
↓
Alice balance = 100
```

Puede utilizarse para:

* governance;
* airdrops;
* distributions.

---

# 117. Token Holder vs Token Owner

En ERC-20 normalmente hablamos de:

```text
balance
```

Por ejemplo:

```text
Alice owns 100 TOKEN
```

En ERC-721 hablamos frecuentemente de:

```text
ownerOf(tokenId)
```

porque cada NFT es individual.

---

# 118. NFTs pueden tener approvals

ERC-721 también posee mecanismos de autorización.

Conceptualmente podemos permitir:

```text
Operator
↓
transfer NFT
```

Esto permite que marketplaces puedan gestionar transferencias autorizadas.

---

# 119. Approval individual

Podemos autorizar una dirección para un NFT concreto.

Conceptualmente:

```text
NFT #50
↓
approved address
```

---

# 120. Approval for All

También existe un patrón donde un usuario autoriza a un operador para gestionar múltiples NFTs.

Conceptualmente:

```text
Alice
↓
setApprovalForAll
↓
Marketplace
```

Esto es poderoso y requiere precaución.

---

# 121. Firma vs Approval

No confundas:

```text
Signature
```

con:

```text
Approval
```

Una firma demuestra autorización criptográfica.

Un approval puede modificar estado del token para registrar permiso.

Conceptualmente:

```text
Signature
↓
cryptographic authorization
```

```text
Approval
↓
on-chain permission
```

---

# 122. Permit

Existen extensiones que permiten gestionar autorizaciones utilizando firmas.

Conceptualmente:

```text
User
↓
sign message
↓
another party submits
↓
allowance created
```

Esto puede reducir determinadas interacciones necesarias.

Es un concepto más avanzado que veremos después.

---

# 123. Permit no es parte del ERC-20 básico

Es importante distinguir:

```text
ERC-20
```

de extensiones adicionales.

Un token ERC-20 tradicional no tiene por obligación implementar todas las funciones avanzadas que podamos encontrar en otros tokens.

---

# 124. Tokens pueden recibir upgrades

Algunos tokens utilizan:

```text
Proxy Contracts
```

Esto puede permitir cambiar su implementación.

Conceptualmente:

```text
Token Address
↓
Proxy
↓
Implementation V1
```

Después:

```text
Token Address
↓
Proxy
↓
Implementation V2
```

Esto introduce:

```text
upgrade risk
```

y posibles permisos administrativos.

---

# 125. Immutable Token Contracts

Otros tokens pueden desplegarse sin mecanismos de upgrade.

Entonces su runtime bytecode permanece asociado a la dirección sin un sistema proxy de actualización.

Cada modelo tiene diferentes ventajas y riesgos.

---

# 126. Antes de confiar en un token

Podemos preguntarnos:

```text
¿En qué red existe?
```

```text
¿Cuál es su contract address?
```

```text
¿Quién puede hacer mint?
```

```text
¿Puede pausarse?
```

```text
¿Puede bloquear cuentas?
```

```text
¿Es upgradeable?
```

```text
¿Quién controla los upgrades?
```

```text
¿Tiene transfer fees?
```

```text
¿Ha sido auditado?
```

---

# 127. Ejemplo completo ERC-20

Supongamos:

```text
Developer Token
Symbol: DEV
Decimals: 18
Supply: 1000 DEV
```

Estado:

```text
Alice
↓
700 DEV

Bob
↓
300 DEV
```

Entonces:

```text
totalSupply
=
1000 DEV
```

Alice ejecuta:

```solidity
transfer(bob, 100);
```

Después:

```text
Alice
↓
600 DEV
```

```text
Bob
↓
400 DEV
```

y el contrato puede emitir:

```text
Transfer(Alice, Bob, 100)
```

---

# 128. Ejemplo completo Approval

Alice:

```text
1000 DEV
```

Quiere utilizar un DEX.

Primero:

```solidity
approve(dex, 200);
```

Estado:

```text
allowance[Alice][DEX]
=
200
```

Después el DEX ejecuta:

```solidity
transferFrom(
    Alice,
    pool,
    150
);
```

Ahora:

```text
Alice
↓
850 DEV
```

y la allowance restante puede quedar conceptualmente en:

```text
50 DEV
```

---

# 129. Ejemplo completo NFT

Contrato:

```text
CryptoAnimals
```

Tiene:

```text
NFT #1 → Alice

NFT #2 → Bob

NFT #3 → Alice
```

Entonces:

```text
balanceOf(Alice)
=
2
```

y:

```text
ownerOf(2)
=
Bob
```

---

# 130. Modelo mental ERC-20

```text
                   ERC-20 Contract
                          │
          ┌───────────────┼───────────────┐
          │               │               │
       Balances        Allowances       Supply
          │               │               │
        Alice         Alice → DEX       1,000,000
        Bob
        Carol
```

Funciones:

```text
balanceOf()
transfer()
approve()
allowance()
transferFrom()
```

---

# 131. Modelo mental ERC-721

```text
                  ERC-721 Contract
                         │
             ┌───────────┼───────────┐
             │           │           │
          tokenId      owner       metadata
             │
        ┌────┼────┐
        │    │    │
        1    2    3
        │    │    │
      Alice Bob Carol
```

---

# 132. Modelo mental de token

```text
Ethereum
   ↓
Token Contract
   │
   ├── Rules
   ├── Balances
   ├── Supply
   ├── Permissions
   └── Events
```

---

# 133. Modelo mental de transferencia ERC-20

```text
Alice
↓
Wallet
↓
Transaction
↓
Token Contract
↓
transfer()
↓
Update balances
↓
Emit Transfer
↓
New State
```

---

# 134. Modelo mental de Approval

```text
Alice
↓
approve
↓
Token Contract
↓
Allowance
↓
DEX
↓
transferFrom
↓
Move Alice's tokens
```

---

# 135. Errores comunes

## Error 1

```text
Token
=
Blockchain
```

Incorrecto.

Muchos tokens existen dentro de otra blockchain.

---

## Error 2

```text
ETH
=
ERC-20
```

Incorrecto.

ETH es el activo nativo de Ethereum.

---

## Error 3

```text
Wallet
=
lugar donde físicamente están mis tokens
```

Incorrecto.

La blockchain mantiene balances y ownership.

La wallet administra claves.

---

## Error 4

```text
Name + Symbol
=
token legítimo
```

Incorrecto.

Debemos verificar:

```text
Network
+
Contract Address
```

---

## Error 5

```text
approve()
=
transfer()
```

Incorrecto.

`approve()` concede permiso.

---

## Error 6

```text
Tengo tokens, por eso puedo transferirlos
```

No necesariamente.

También necesitamos suficiente activo nativo para pagar gas.

---

## Error 7

```text
Todos los ERC-20 utilizan 18 decimals
```

Incorrecto.

Es común, pero no obligatorio.

---

## Error 8

```text
NFT
=
imagen
```

Incorrecto.

El NFT es el token.

La imagen puede formar parte de su metadata.

---

## Error 9

```text
ERC-20 compatible
=
todos los tokens funcionan exactamente igual
```

Incorrecto.

Pueden tener lógica adicional.

---

## Error 10

```text
Infinite Approval
=
sin riesgo
```

Incorrecto.

Es un permiso importante que puede aumentar el impacto de un contrato comprometido o malicioso.

---

# 136. Preguntas de repaso

Intenta responder:

1. ¿Qué es un token?
2. ¿Un token necesita su propia blockchain?
3. ¿Qué diferencia existe entre ETH y un ERC-20?
4. ¿Dónde existe realmente el balance de un token?
5. ¿La wallet almacena físicamente los tokens?
6. ¿Qué significa fungible?
7. ¿Qué significa non-fungible?
8. ¿Qué es ERC?
9. ¿Por qué existen estándares?
10. ¿Qué es ERC-20?
11. ¿Qué hace `balanceOf()`?
12. ¿Qué significa `totalSupply`?
13. ¿Qué significa mint?
14. ¿Qué significa burn?
15. ¿Quién puede hacer mint?
16. ¿Qué significa `decimals`?
17. ¿Todos los tokens usan 18 decimals?
18. ¿Qué hace `transfer()`?
19. ¿Qué hace `approve()`?
20. ¿Qué significa allowance?
21. ¿Qué hace `transferFrom()`?
22. ¿Approve transfiere tokens?
23. ¿Qué riesgo tienen las infinite approvals?
24. ¿Qué es ERC-721?
25. ¿Qué es un `tokenId`?
26. ¿Qué hace `ownerOf()`?
27. ¿Un NFT es necesariamente una imagen?
28. ¿Qué es metadata?
29. ¿Qué es ERC-1155?
30. ¿Qué es una stablecoin?
31. ¿Qué es WETH?
32. ¿Qué diferencia existe entre ETH y WETH?
33. ¿Un token existe automáticamente en todas las redes?
34. ¿Por qué debemos verificar la contract address?
35. ¿Qué es un holder?
36. ¿Puede un token ser pausado?
37. ¿Puede un token bloquear direcciones?
38. ¿Puede un token cobrar comisiones por transferencia?
39. ¿Qué significa upgradeable?
40. ¿Por qué OpenZeppelin será útil para crear tokens?

---

# 137. Lo que todavía NO necesitas dominar

Todavía no necesitas estudiar en profundidad:

```text
ERC-2612 Permit

EIP-712 signatures

ERC-4626 Vaults

ERC-777

ERC-1363

ERC-2981 royalties

ERC-4907

Token Hooks

Rebasing mathematics

Fee-on-transfer internals

Flash Minting

Votes extensions

Snapshot internals

Upgradeable tokens

Storage layout

Diamond patterns

Cross-chain token standards
```

Estos conceptos tendrán más sentido después de dominar:

```text
Solidity

Testing

OpenZeppelin

Security
```

---

# 138. Conceptos que debes recordar

### Token

Activo digital representado mediante reglas blockchain.

### ETH

Activo nativo de Ethereum.

### ERC-20

Estándar para tokens fungibles.

### ERC-721

Estándar para NFTs individuales.

### ERC-1155

Estándar para múltiples tipos de tokens.

### Balance

Cantidad que posee una dirección.

### Supply

Cantidad de tokens existentes.

### Mint

Crear tokens.

### Burn

Destruir tokens.

### Decimals

Sistema utilizado para representar unidades fraccionarias mediante enteros.

### Approval

Permiso para que otro address pueda gastar tokens.

### Allowance

Cantidad autorizada.

### transferFrom

Permite utilizar una allowance para mover tokens.

### tokenId

Identificador individual de un NFT.

### Metadata

Información asociada a un token.

---

# 139. Relación con lo aprendido

Hasta ahora:

```text
Ethereum
↓
Blockchain programable
```

```text
EVM
↓
Ejecuta smart contracts
```

```text
Gas
↓
Mide trabajo computacional
```

```text
Networks
↓
Determinan dónde existe el estado
```

Ahora:

```text
Tokens
↓
Activos construidos mediante smart contracts
```

---

# 140. Modelo completo

```text
User
↓
Wallet
↓
Transaction
↓
Ethereum
↓
EVM
↓
Token Contract
↓
Balances / Ownership
↓
New State
```

Por ejemplo:

```text
Alice
↓
transfer Bob 100 TOKEN
↓
Transaction
↓
Token Contract
↓
balances[Alice] -= 100
balances[Bob] += 100
↓
New State
```

---

# 141. ERC-20 mental model

Cuando veas un ERC-20 piensa:

```text
Token Contract
│
├── balances
├── allowances
├── totalSupply
│
├── transfer
├── approve
└── transferFrom
```

---

# 142. ERC-721 mental model

Cuando veas un ERC-721 piensa:

```text
NFT Contract
│
├── tokenId
├── owner
├── approvals
└── metadata
```

---

# 143. Regla fundamental

Cuando alguien te diga:

```text
Tengo 100 TOKEN
```

pregúntate:

```text
¿En qué network?
```

```text
¿Cuál es el contract address?
```

Cuando alguien te diga:

```text
Este token es USDC
```

pregúntate:

```text
¿Es el contrato oficial?
```

Cuando una aplicación solicite:

```text
Approve
```

pregúntate:

```text
¿Qué contrato estoy autorizando?
```

```text
¿Cuánto estoy autorizando?
```

Estas preguntas son fundamentales para utilizar tokens de manera segura.

---

# 144. Siguiente paso

Con este archivo ya comprendemos conceptualmente:

```text
Ethereum
```

```text
EVM
```

```text
Gas
```

```text
Networks
```

```text
Tokens
```

Los otros fundamentos importantes son comprender en profundidad:

```text
Wallets
```

y:

```text
Transactions
```

Cuando estas bases estén claras podremos comenzar:

```text
01-fundamentos-solidity/
```

y finalmente escribir contratos que implementen todas estas ideas.

Más adelante volveremos específicamente a tokens en:

```text
08-erc20/
```

y:

```text
09-erc721/
```

donde construiremos implementaciones reales con Solidity, Hardhat y OpenZeppelin.

---

# Resumen

Un token es un activo digital representado mediante reglas blockchain.

En Ethereum muchos tokens son:

```text
Smart Contracts
```

Por ejemplo:

```text
Ethereum
↓
ERC-20 Contract
↓
Balances
↓
Transfers
```

Los tokens fungibles utilizan comúnmente:

```text
ERC-20
```

Los NFTs:

```text
ERC-721
```

Y múltiples tipos de activos pueden utilizar:

```text
ERC-1155
```

La diferencia fundamental:

```text
ETH
=
native asset
```

mientras:

```text
ERC-20 Token
=
smart contract
```

Para ERC-20 recuerda:

```text
balanceOf
transfer
approve
allowance
transferFrom
totalSupply
```

Para ERC-721 recuerda:

```text
tokenId
ownerOf
balanceOf
metadata
approvals
```

Y siempre:

```text
Token Identity
=
Network
+
Contract Address
```

No:

```text
Name
+
Symbol
```

Finalmente:

```text
Wallet
↓
no guarda los tokens
```

La blockchain mantiene:

```text
balances
ownership
state
```

y la wallet mantiene las claves necesarias para controlar una cuenta.
