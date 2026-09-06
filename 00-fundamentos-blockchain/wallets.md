# Wallets en Ethereum

Una wallet es una de las herramientas más importantes para interactuar con Ethereum.

Nos permite:

* gestionar cuentas;
* firmar transacciones;
* firmar mensajes;
* conectarnos a dApps;
* cambiar de red;
* consultar balances;
* interactuar con smart contracts.

Pero existe una idea fundamental que debemos entender desde el principio:

> Una wallet no almacena literalmente tus ETH, tokens o NFTs.

Los activos existen dentro del estado de la blockchain.

La wallet administra principalmente:

```text
Claves
↓
Firmas
↓
Cuentas
```

Podemos pensar:

```text
Blockchain
↓
mantiene balances y ownership
```

mientras:

```text
Wallet
↓
gestiona las claves necesarias para controlarlos
```

---

# 1. ¿Qué es una wallet?

Una wallet es una herramienta que permite administrar claves criptográficas y utilizarlas para interactuar con redes blockchain.

Conceptualmente:

```text
Usuario
↓
Wallet
↓
Private Key
↓
Signature
↓
Transaction
↓
Ethereum
```

La wallet actúa como intermediario entre:

```text
Usuario
```

y:

```text
Blockchain
```

---

# 2. La wallet no contiene tus monedas

Supongamos que Alice tiene:

```text
5 ETH
```

No existen literalmente:

```text
5 ETH
```

guardados dentro de MetaMask o cualquier otra wallet.

Ethereum mantiene algo equivalente a:

```text
Address Alice
↓
Balance = 5 ETH
```

La wallet conoce o administra las claves que permiten autorizar operaciones desde esa dirección.

---

# 3. ¿Qué ocurre si cierro la wallet?

Tus activos no desaparecen.

¿Por qué?

Porque existen en:

```text
Blockchain State
```

No en:

```text
Wallet App
```

Si recuperas correctamente las claves en otra wallet compatible, puedes volver a controlar las mismas cuentas.

---

# 4. Wallet vs Account

No debemos confundir:

```text
Wallet
```

con:

```text
Account
```

Una wallet es una herramienta.

Una cuenta es una identidad dentro de una blockchain.

Conceptualmente:

```text
Wallet
│
├── Account 1
├── Account 2
├── Account 3
└── Account 4
```

Una misma wallet puede administrar múltiples cuentas.

---

# 5. EOA

La cuenta tradicional controlada mediante claves se conoce como:

```text
EOA
```

que significa:

```text
Externally Owned Account
```

Una EOA puede:

* poseer ETH;
* poseer tokens;
* poseer NFTs;
* enviar transacciones;
* firmar mensajes;
* desplegar contratos;
* interactuar con smart contracts.

---

# 6. EOA vs Contract Account

Ethereum distingue conceptualmente:

```text
EOA
↓
controlada mediante claves
```

y:

```text
Contract Account
↓
controlada mediante código
```

Ejemplo:

```text
Alice Wallet
↓
EOA
↓
Transaction
↓
Smart Contract
```

---

# 7. Private Key

Una:

```text
private key
```

es un número secreto utilizado para crear firmas criptográficas.

Conceptualmente:

```text
Private Key
↓
Sign
↓
Signature
```

La private key es una de las piezas más sensibles de una wallet.

---

# 8. La private key debe permanecer secreta

Regla fundamental:

```text
Private Key
=
Secret
```

Quien obtiene una private key puede firmar operaciones como esa cuenta.

Por tanto nunca debemos compartirla mediante:

* GitHub;
* Discord;
* Telegram;
* correo;
* formularios;
* capturas de pantalla;
* código fuente;
* documentación;
* commits;
* chats;
* archivos públicos.

---

# 9. Ejemplo conceptual

Alice tiene:

```text
Private Key A
```

Esa clave controla una cuenta.

Si Bob obtiene:

```text
Private Key A
```

Bob puede producir firmas válidas desde esa misma cuenta.

Ethereum no sabe:

```text
"esto ahora es Bob"
```

Solo puede verificar:

```text
firma válida
```

---

# 10. Blockchain no conoce tu identidad real

Ethereum normalmente ve:

```text
0xABC...
```

No necesariamente sabe si esa address pertenece a:

```text
Alice
Bob
Empresa
DAO
Exchange
Bot
```

La blockchain trabaja con claves, firmas y direcciones.

---

# 11. Public Key

A partir de una private key podemos derivar una:

```text
public key
```

Conceptualmente:

```text
Private Key
↓
Public Key
```

La relación está diseñada para que conocer la public key no permita recuperar fácilmente la private key.

---

# 12. Private Key → Public Key

La relación es unidireccional desde el punto de vista práctico.

```text
Private Key
↓
Public Key
```

Pero no:

```text
Public Key
↓
Private Key
```

de forma computacionalmente viable con la criptografía utilizada correctamente.

---

# 13. Address

Una address Ethereum se deriva a partir de información relacionada con la public key.

Conceptualmente:

```text
Private Key
↓
Public Key
↓
Hashing
↓
Address
```

La dirección tiene un formato parecido a:

```text
0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

---

# 14. Modelo simplificado

La cadena mental importante es:

```text
Private Key
↓
Public Key
↓
Address
```

La private key:

```text
firma
```

La public key:

```text
permite verificar
```

La address:

```text
identifica la cuenta
```

---

# 15. Address puede compartirse

Una address está diseñada para ser pública.

Por ejemplo puedes enviar:

```text
0xABC...
```

a alguien para que te envíe ETH.

No es equivalente a compartir:

```text
Private Key
```

---

# 16. Address vs Private Key

```text
Address
↓
Public
```

```text
Private Key
↓
Secret
```

Nunca confundas ambas.

---

# 17. Una address no permite gastar fondos

Conocer:

```text
0xABC...
```

permite consultar públicamente información relacionada con esa cuenta.

Por ejemplo:

* balance;
* transacciones;
* tokens;
* NFTs.

Pero no permite firmar como esa cuenta.

Para ello se necesita la capacidad criptográfica correspondiente.

---

# 18. Firmas digitales

Una wallet utiliza la private key para crear:

```text
digital signatures
```

Conceptualmente:

```text
Data
+
Private Key
↓
Signature
```

Esta firma puede verificarse utilizando criptografía.

---

# 19. ¿Qué demuestra una firma?

Una firma válida demuestra que alguien con acceso a la clave correspondiente autorizó determinados datos.

No necesitamos revelar:

```text
Private Key
```

para demostrarlo.

---

# 20. Firmar una transacción

Supongamos que Alice quiere enviar:

```text
1 ETH
```

a Bob.

La wallet construye una transacción.

Conceptualmente:

```text
to = Bob

value = 1 ETH

nonce = ...

chainId = ...

gas = ...
```

Después Alice firma.

```text
Transaction Data
+
Private Key
↓
Signature
```

---

# 21. La private key no se envía a Ethereum

Esto es fundamental.

No ocurre:

```text
Wallet
↓
Send Private Key
↓
Ethereum
```

Ocurre:

```text
Wallet
↓
Sign Locally
↓
Signed Transaction
↓
Ethereum
```

La private key puede permanecer dentro de la wallet.

---

# 22. Verificación

Los nodos pueden verificar criptográficamente la firma.

Conceptualmente:

```text
Transaction
+
Signature
↓
Verification
↓
Sender recovered
```

Por eso Ethereum puede determinar:

```text
from
```

sin recibir la private key.

---

# 23. Signer

En desarrollo aparecerá constantemente el concepto:

```text
Signer
```

Un signer representa una entidad capaz de firmar.

Por ejemplo:

```text
Signer
↓
Alice
```

puede firmar una transacción.

---

# 24. Provider vs Signer

Esta diferencia será muy importante con ethers y Hardhat.

```text
Provider
↓
conecta con blockchain
```

Mientras:

```text
Signer
↓
puede autorizar operaciones
```

---

# 25. Provider

Un provider permite operaciones como:

```text
leer balance

consultar bloque

consultar contrato

consultar transaction
```

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

---

# 26. Signer

Un signer permite:

```text
firmar mensaje

firmar transaction

enviar transaction
```

Conceptualmente:

```text
Application
↓
Signer
↓
Signature
```

---

# 27. Provider + Signer

Para interactuar completamente con Ethereum normalmente necesitamos ambas capacidades:

```text
Provider
↓
Network Connection
```

```text
Signer
↓
Authorization
```

Entonces:

```text
Signer
+
Provider
↓
Signed Transaction
↓
Network
```

---

# 28. Wallet de software

Una:

```text
software wallet
```

es una wallet que funciona mediante software.

Por ejemplo puede existir como:

* extensión del navegador;
* aplicación móvil;
* aplicación de escritorio.

Ejemplo conceptual:

```text
Browser
↓
Wallet Extension
↓
Account
```

---

# 29. MetaMask

MetaMask es un ejemplo conocido de wallet de software utilizada para interactuar con redes EVM.

Puede permitir:

* administrar cuentas;
* cambiar redes;
* firmar;
* conectarse a dApps;
* enviar ETH;
* interactuar con contratos.

Durante desarrollo probablemente verás herramientas de este tipo con frecuencia.

---

# 30. Hardware Wallet

Una:

```text
hardware wallet
```

es un dispositivo diseñado para mantener las claves aisladas del computador principal.

Conceptualmente:

```text
Computer
↓
Unsigned Transaction
↓
Hardware Wallet
↓
User confirms
↓
Signature
↓
Computer
↓
Network
```

---

# 31. Ventaja fundamental de Hardware Wallet

Idealmente la private key:

```text
never leaves the device
```

El dispositivo recibe información para firmar y devuelve:

```text
Signature
```

No la clave.

---

# 32. Hardware Wallet no elimina todos los riesgos

Aunque la clave esté protegida, un usuario todavía puede aprobar una operación peligrosa.

Por ejemplo:

```text
Malicious dApp
↓
Dangerous Transaction
↓
Hardware Wallet
↓
User approves
```

La wallet puede firmar correctamente una operación dañina si el usuario la autoriza.

Por eso:

```text
secure key storage
≠
safe transaction
```

---

# 33. Seed Phrase

Muchas wallets utilizan una:

```text
seed phrase
```

También llamada:

```text
recovery phrase
```

Puede consistir en una lista de palabras utilizada para derivar múltiples claves.

---

# 34. Ejemplo conceptual

```text
Seed Phrase
↓
Key Derivation
│
├── Private Key 1
├── Private Key 2
├── Private Key 3
└── Private Key 4
```

Por eso una sola seed phrase puede recuperar múltiples cuentas.

---

# 35. Seed Phrase ≠ Private Key

No son exactamente lo mismo.

Una private key controla una clave concreta.

Una seed phrase puede permitir derivar:

```text
muchas private keys
```

Conceptualmente:

```text
Seed
↓
Private Key A
↓
Address A
```

```text
Seed
↓
Private Key B
↓
Address B
```

---

# 36. La seed phrase es extremadamente sensible

Si alguien obtiene tu seed phrase, puede potencialmente reconstruir las claves asociadas.

Por eso:

```text
Seed Phrase
=
Critical Secret
```

Debe protegerse incluso más cuidadosamente que una contraseña normal.

---

# 37. Nunca introduzcas una seed phrase en sitios aleatorios

Una estafa común pide:

```text
Enter your recovery phrase
```

para:

```text
verify wallet
```

o:

```text
claim reward
```

Esto es extremadamente peligroso.

Una dApp normal no necesita tu seed phrase para conectarse a una wallet.

---

# 38. Conectar Wallet ≠ Compartir Seed

Cuando haces:

```text
Connect Wallet
```

una aplicación recibe normalmente información como:

```text
Address
```

y puede solicitar firmas.

No necesita recibir:

```text
Private Key
```

ni:

```text
Seed Phrase
```

---

# 39. Recovery

La seed phrase puede utilizarse para recuperar cuentas si:

```text
pierdes el dispositivo
```

o:

```text
instalas otra wallet compatible
```

Conceptualmente:

```text
Seed Phrase
↓
Restore Wallet
↓
Derived Keys
↓
Same Addresses
```

---

# 40. Deterministic Wallets

Muchas wallets modernas utilizan derivación determinista.

Esto significa que múltiples claves pueden generarse a partir de una misma raíz.

Conceptualmente:

```text
Seed
     │
     ├── Account 0
     ├── Account 1
     ├── Account 2
     └── Account 3
```

Esto facilita backups.

---

# 41. HD Wallet

Podrás encontrar el término:

```text
HD Wallet
```

que significa:

```text
Hierarchical Deterministic Wallet
```

Permite derivar múltiples cuentas de forma estructurada desde una semilla.

---

# 42. Derivation Path

Las wallets HD utilizan conceptos llamados:

```text
derivation paths
```

para determinar cómo derivar cuentas.

Conceptualmente:

```text
Seed
↓
Path A
↓
Account A
```

```text
Seed
↓
Path B
↓
Account B
```

No necesitamos dominar todavía la estructura exacta.

---

# 43. Misma Seed, diferentes cuentas

Una wallet puede mostrar:

```text
Account 1
0xAAA...
```

```text
Account 2
0xBBB...
```

```text
Account 3
0xCCC...
```

Todas pueden derivarse de la misma seed phrase.

---

# 44. Importar una private key

Algunas wallets permiten importar directamente:

```text
Private Key
```

Eso puede agregar una cuenta concreta.

Pero esa cuenta importada no necesariamente pertenece a la misma jerarquía derivada de la seed principal.

---

# 45. Exportar private keys

Algunas wallets permiten exportar claves.

Esto debe hacerse con enorme precaución.

Una private key exportada puede terminar accidentalmente en:

* clipboard;
* screenshots;
* shell history;
* notes;
* cloud sync;
* malware;
* repositorios.

---

# 46. Password de Wallet

Muchas wallets permiten establecer una contraseña local.

Esta contraseña:

```text
no es necesariamente la private key
```

ni:

```text
la seed phrase
```

Puede utilizarse para proteger localmente datos cifrados de la wallet.

---

# 47. Password vs Seed Phrase

```text
Wallet Password
↓
protects local wallet access
```

Mientras:

```text
Seed Phrase
↓
can reconstruct keys
```

Perder la contraseña local puede ser recuperable si conservas correctamente la seed.

Perder la seed y todas las claves puede significar perder el acceso.

---

# 48. Blockchain no tiene "Forgot Password"

En sistemas tradicionales:

```text
Forgot Password
↓
Email Reset
```

En wallets autocustodiadas puede no existir una autoridad capaz de restaurar tus claves.

Por eso la gestión de backups es responsabilidad crítica.

---

# 49. Custodial Wallet

Una wallet:

```text
custodial
```

implica que otra entidad mantiene control o custodia de las claves.

Por ejemplo:

```text
User
↓
Exchange
↓
Exchange controls keys
```

El usuario accede mediante una cuenta del servicio.

---

# 50. Non-Custodial Wallet

Una wallet:

```text
non-custodial
```

o autocustodiada permite que el usuario controle directamente las claves.

Conceptualmente:

```text
User
↓
Private Keys
↓
Blockchain
```

---

# 51. Custodial vs Non-Custodial

```text
Custodial
↓
third party controls keys
```

Mientras:

```text
Non-Custodial
↓
user controls keys
```

Cada modelo tiene diferentes:

* riesgos;
* responsabilidades;
* mecanismos de recuperación;
* experiencia de usuario.

---

# 52. "Not your keys, not your coins"

Probablemente encontrarás esta frase frecuentemente:

```text
Not your keys,
not your coins
```

Su idea general es:

> Si otra entidad controla las claves, dependes de esa entidad para acceder a los activos.

Es una simplificación útil, aunque la custodia real puede tener modelos mucho más complejos.

---

# 53. Exchange Account ≠ Wallet autocustodiada

Si tienes ETH dentro de un exchange centralizado, muchas veces el sistema interno del exchange mantiene balances en su propia base de datos.

Conceptualmente:

```text
User
↓
Exchange Account
↓
Exchange Infrastructure
↓
Exchange Wallets
↓
Blockchain
```

No necesariamente tienes una private key individual para cada balance mostrado.

---

# 54. Smart Contract Wallet

No todas las wallets necesitan ser simples EOAs.

También existen:

```text
Smart Contract Wallets
```

donde la cuenta está implementada mediante un smart contract.

Esto permite reglas más avanzadas.

---

# 55. Ejemplo de Smart Wallet

Una smart wallet podría permitir:

```text
2-of-3 signatures
```

o:

```text
daily spending limit
```

o:

```text
social recovery
```

o:

```text
session keys
```

Conceptualmente:

```text
User
↓
Smart Wallet Contract
↓
Rules
↓
Ethereum
```

---

# 56. Multisig

Una:

```text
multisig
```

requiere múltiples autorizaciones.

Por ejemplo:

```text
2 of 3
```

Tenemos:

```text
Alice
Bob
Carol
```

Una operación necesita al menos dos aprobaciones.

---

# 57. Multisig Example

```text
Transaction Proposal
      ↓
Alice approves
      ↓
Bob approves
      ↓
Threshold reached
      ↓
Execute
```

Este patrón puede ser útil para:

* DAOs;
* treasuries;
* protocolos;
* administración de contratos.

---

# 58. Single Key Risk

Una EOA controlada por una única private key tiene un riesgo evidente:

```text
Private Key compromised
↓
Account compromised
```

Por eso cuentas administrativas importantes suelen utilizar mecanismos más robustos.

---

# 59. Account Abstraction

También existe el concepto:

```text
Account Abstraction
```

que busca permitir cuentas más programables.

Puede habilitar experiencias como:

* recuperación flexible;
* batching;
* patrocinio de gas;
* políticas de firmas;
* session keys;
* distintos esquemas de autenticación.

Es un tema avanzado.

---

# 60. Wallet y Red

Una misma wallet puede conectarse a múltiples redes.

Por ejemplo:

```text
Wallet
│
├── Ethereum Mainnet
├── Sepolia
├── Local
└── Layer 2
```

La cuenta puede tener la misma address en varias redes.

---

# 61. Misma Address, diferente estado

Supongamos:

```text
0xABC...
```

En Mainnet:

```text
2 ETH
```

En Sepolia:

```text
10 test ETH
```

En local:

```text
10000 fake ETH
```

La wallet cambia de red y muestra el estado correspondiente.

---

# 62. Cambiar de red no mueve fondos

Cuando hacemos:

```text
Switch Network
```

no estamos moviendo los activos.

Solo cambiamos:

```text
qué blockchain estamos consultando
```

Por tanto:

```text
Switch Network
≠
Bridge
```

---

# 63. Wallet y Chain ID

La wallet utiliza información como:

```text
chainId
```

para saber con qué red interactúa.

Por ejemplo:

```text
Ethereum Mainnet
chainId = 1
```

La dApp también puede comprobar el chain ID antes de pedir una operación.

---

# 64. Wrong Network

Una dApp puede requerir:

```text
Sepolia
```

pero la wallet está en:

```text
Mainnet
```

Entonces puede aparecer:

```text
Wrong Network
```

La dApp debería impedir o advertir sobre operaciones incompatibles.

---

# 65. Añadir Redes

Las wallets pueden permitir añadir configuraciones de red utilizando datos como:

```text
Network Name

RPC URL

Chain ID

Native Currency

Block Explorer
```

Debemos utilizar configuraciones de fuentes confiables.

---

# 66. RPC en una wallet

La wallet necesita comunicarse con un nodo.

Conceptualmente:

```text
Wallet
↓
RPC
↓
Node
↓
Ethereum
```

Así puede:

* consultar balances;
* consultar nonces;
* estimar gas;
* enviar transacciones;
* consultar receipts.

---

# 67. Wallet y Provider

En un navegador, una wallet puede proporcionar acceso a un:

```text
provider
```

que las dApps utilizan para comunicarse con la blockchain y solicitar acceso a cuentas.

Conceptualmente:

```text
DApp
↓
Wallet Provider
↓
RPC
↓
Network
```

---

# 68. Conectar una dApp

Cuando pulsamos:

```text
Connect Wallet
```

conceptualmente ocurre:

```text
DApp
↓
requests account access
↓
Wallet
↓
User approves
↓
Address exposed to dApp
```

Esto no significa automáticamente que la dApp pueda gastar fondos.

---

# 69. Connect Wallet no mueve fondos

Conectar normalmente significa permitir que la aplicación conozca:

```text
Address
```

y pueda solicitar acciones.

No significa:

```text
send ETH
```

ni:

```text
approve tokens
```

ni:

```text
give private key
```

---

# 70. La dApp puede solicitar una transacción después

Después de conectar:

```text
DApp
↓
requests transaction
↓
Wallet popup
↓
User reviews
↓
User signs
```

El usuario todavía debe autorizar la operación.

---

# 71. Firma de mensaje

Una dApp también puede solicitar:

```text
Sign Message
```

Esto no necesariamente crea una transacción.

Conceptualmente:

```text
Message
↓
Wallet
↓
Signature
```

Puede utilizarse para:

* login;
* autenticación;
* permisos;
* órdenes off-chain.

---

# 72. Firma ≠ Transaction

Este punto es importante:

```text
Signature
≠
Transaction
```

Una firma puede ocurrir completamente off-chain.

Por tanto:

```text
Sign Message
```

puede no consumir gas.

---

# 73. Pero una firma puede conceder autorización

Aunque no consuma gas, una firma puede seguir siendo importante.

Una firma puede autorizar:

* órdenes;
* permits;
* acciones posteriores;
* login;
* operaciones delegadas.

Por eso no debemos firmar mensajes que no comprendamos.

---

# 74. Blind Signing

El término:

```text
blind signing
```

se utiliza cuando el usuario firma datos sin poder interpretar claramente qué está autorizando.

Esto puede ser peligroso.

Regla:

```text
Don't blindly sign
```

---

# 75. Transaction Preview

Antes de firmar una transacción una wallet debería mostrar información como:

```text
Network

From

To

Value

Gas Fee

Contract Interaction
```

En operaciones complejas puede intentar mostrar también:

```text
Function

Token

Approval

Estimated Changes
```

---

# 76. Revisar `to`

Siempre debemos verificar el destino.

Ejemplo:

```text
to:
0xABC...
```

Una diferencia de un carácter puede significar:

```text
otra cuenta
```

y una transferencia blockchain normalmente no puede revertirse mediante soporte técnico central.

---

# 77. Address Poisoning

Existen ataques donde un atacante intenta introducir en el historial direcciones visualmente parecidas a una dirección legítima.

Por ejemplo:

```text
Legit:
0x1234...ABCD
```

```text
Attacker:
0x1234...ABCD
```

pueden parecer similares cuando una interfaz recorta caracteres.

Nunca debemos confiar únicamente en copiar una dirección desde el historial sin verificarla.

---

# 78. Clipboard Malware

También existe malware que puede detectar una address copiada y sustituirla por otra.

Por eso para operaciones importantes conviene verificar:

```text
inicio

final

y preferiblemente address completa
```

antes de firmar.

---

# 79. ENS

Ethereum también posee sistemas de nombres que pueden representar addresses.

Por ejemplo conceptualmente:

```text
alice.eth
↓
0xABC...
```

Esto puede mejorar la experiencia de usuario.

Pero debemos seguir verificando correctamente el nombre y la resolución.

---

# 80. ENS no cambia el modelo de claves

Aunque utilicemos:

```text
alice.eth
```

la blockchain termina interactuando con:

```text
address
```

La wallet sigue necesitando una firma de la cuenta correspondiente.

---

# 81. Wallet Balance

La wallet consulta el balance de ETH mediante la red.

Conceptualmente:

```text
Wallet
↓
RPC
↓
Node
↓
getBalance(address)
↓
ETH Balance
```

---

# 82. Token Balance

Para un ERC-20:

```text
Wallet
↓
Token Contract
↓
balanceOf(address)
↓
Token Balance
```

Por eso una wallet puede necesitar conocer el contrato del token.

---

# 83. NFT Ownership

Para un NFT puede consultar información de:

```text
ERC-721 Contract
```

o utilizar:

```text
indexers
```

para mostrar las colecciones de forma más eficiente.

---

# 84. Import Token

Algunas wallets permiten:

```text
Import Token
```

Esto normalmente no mueve tokens.

Simplemente ayuda a que la interfaz conozca:

```text
Token Contract Address
```

y pueda mostrar el balance.

---

# 85. El token ya existía

Si importas un ERC-20 en la wallet:

```text
Token
↓
appears in UI
```

pero su balance ya existía previamente en la blockchain.

La wallet simplemente comenzó a mostrarlo.

---

# 86. Eliminar un token de la interfaz no destruye el token

Si ocultas:

```text
TOKEN
```

en la wallet, no significa:

```text
burn TOKEN
```

La blockchain mantiene el balance.

Solo cambia la interfaz.

---

# 87. Wallet y Nonce

Antes de enviar una transacción la wallet puede consultar:

```text
nonce
```

de la cuenta.

Entonces:

```text
Alice current nonce = 10
```

la siguiente transacción utilizará el nonce correspondiente.

---

# 88. Wallet y Gas

La wallet también puede estimar:

```text
gas limit
```

y parámetros de tarifa.

Conceptualmente:

```text
Proposed Transaction
↓
Simulation
↓
Gas Estimate
↓
Wallet UI
```

---

# 89. Speed Up

Si una transacción está pendiente, algunas wallets permiten:

```text
Speed Up
```

Conceptualmente:

```text
same nonce
+
higher fee
```

para intentar reemplazar la transacción pendiente.

---

# 90. Cancel

También pueden mostrar:

```text
Cancel
```

Esto normalmente intenta reemplazar la transacción pendiente mediante otra operación con el mismo nonce.

No elimina mágicamente la transacción original de la red.

---

# 91. Transaction History

La wallet puede mostrar:

```text
sent

received

pending

failed
```

pero esa información deriva de:

```text
blockchain
+
RPC
+
indexing
```

No constituye por sí sola la fuente fundamental del estado.

---

# 92. Wallet y Block Explorer

Muchas wallets permiten abrir una operación en un:

```text
Block Explorer
```

Esto permite inspeccionar:

```text
Transaction Hash

From

To

Value

Gas

Status

Logs
```

---

# 93. Wallet y Smart Contracts

Supongamos:

```solidity
function increment() external;
```

La dApp construye una solicitud.

```text
DApp
↓
Wallet
↓
Transaction
↓
Counter Contract
```

La wallet firma únicamente si el usuario confirma.

---

# 94. Wallet y `msg.sender`

Si Alice firma una transacción directamente hacia un contrato:

```text
Alice EOA
↓
Counter
```

dentro del contrato:

```text
msg.sender = Alice
```

Pero si existe:

```text
Alice
↓
Router
↓
Counter
```

dentro de Counter:

```text
msg.sender = Router
```

La wallet solo inicia la cadena de ejecución.

---

# 95. Wallet y approvals

Cuando una dApp solicita:

```solidity
approve(spender, amount);
```

la wallet está firmando una transacción que puede conceder permiso a otro contrato para gastar tokens.

Por eso debe revisarse cuidadosamente.

---

# 96. Approve no es conectar Wallet

No confundas:

```text
Connect Wallet
```

con:

```text
Approve Token
```

Conectar:

```text
exposes account/address
```

Approve:

```text
creates on-chain spending permission
```

---

# 97. Infinite Approval

Una dApp puede solicitar:

```text
unlimited approval
```

Esto puede ser conveniente porque evita futuras aprobaciones.

Pero aumenta el riesgo si el spender:

* es malicioso;
* contiene un bug;
* es comprometido;
* puede actualizarse maliciosamente.

---

# 98. Revisar Approvals

Debemos comprender:

```text
Spender
```

```text
Token
```

```text
Amount
```

antes de aprobar.

No simplemente pulsar:

```text
Confirm
```

---

# 99. Phishing

Una de las amenazas más comunes para wallets es:

```text
phishing
```

Un atacante puede crear:

* sitio falso;
* dApp falsa;
* dominio parecido;
* mensaje falso;
* soporte falso.

El objetivo suele ser conseguir:

```text
seed phrase
```

o:

```text
dangerous signature
```

o:

```text
malicious transaction
```

---

# 100. Fake Support

Una regla muy importante:

> Nadie necesita tu seed phrase para darte soporte.

Si alguien dice:

```text
"I'm support, send your seed"
```

debemos asumir que existe un grave riesgo.

---

# 101. Airdrop Scams

También podemos recibir tokens o NFTs desconocidos que contienen enlaces.

Ejemplo:

```text
Free Reward
↓
Visit suspicious site
↓
Connect wallet
↓
Sign malicious transaction
```

No debemos interactuar automáticamente con activos desconocidos.

---

# 102. Token Spam

Cualquiera puede enviar ciertos tokens a una address pública.

Por tanto ver un token extraño en la wallet no significa:

```text
legitimate asset
```

Puede ser simplemente spam.

---

# 103. Malicious dApps

Una dApp maliciosa puede intentar solicitar:

```text
Infinite Token Approval
```

o:

```text
Transfer
```

o:

```text
Permit Signature
```

La wallet no puede decidir automáticamente todas las intenciones económicas del usuario.

Debemos revisar lo que firmamos.

---

# 104. Domain Verification

Antes de conectar una wallet es importante revisar:

```text
Domain
```

Por ejemplo:

```text
example.com
```

vs:

```text
examp1e.com
```

Un carácter diferente puede dirigir a una aplicación falsa.

---

# 105. Bookmarks

Para protocolos importantes puede ser buena práctica utilizar:

```text
bookmarks
```

o enlaces obtenidos desde fuentes oficiales en lugar de buscar cada vez mediante anuncios o mensajes.

---

# 106. Separate Wallets

Durante desarrollo es recomendable separar:

```text
Development Wallet
```

de:

```text
Production / Savings Wallet
```

Por ejemplo:

```text
Wallet A
↓
Testnets
Local
Experiments
```

```text
Wallet B
↓
Real Funds
```

Esto reduce el impacto de errores.

---

# 107. Burner Wallet

En pruebas o eventos puedes encontrar el término:

```text
burner wallet
```

Se refiere a una wallet/cuenta creada para uso temporal con cantidades limitadas.

No debería contener fondos importantes.

---

# 108. Hot Wallet

Una:

```text
hot wallet
```

es una wallet cuyas claves están disponibles en un dispositivo conectado a internet.

Tiene mayor comodidad.

Pero también mayor exposición potencial.

---

# 109. Cold Wallet

Una:

```text
cold wallet
```

mantiene las claves fuera de sistemas conectados de manera habitual a internet.

Puede utilizarse para almacenamiento más sensible.

---

# 110. Hot vs Cold

```text
Hot Wallet
↓
convenient
↓
more exposed
```

```text
Cold Storage
↓
less convenient
↓
reduced online exposure
```

No existe seguridad absoluta.

---

# 111. Wallet de desarrollo

Cuando utilicemos Hardhat tendremos cuentas privadas destinadas exclusivamente al entorno local.

Por ejemplo:

```text
Account 0
↓
10000 fake ETH
```

Estas cuentas pueden tener claves conocidas públicamente.

Eso es aceptable únicamente porque:

```text
funds are fake
```

---

# 112. Nunca uses cuentas locales conocidas con dinero real

Hardhat y otras herramientas pueden mostrar private keys de cuentas de prueba.

Nunca envíes:

```text
Mainnet ETH
```

a una cuenta cuya private key sea pública o esté incluida en documentación.

Cualquiera podría retirar esos fondos.

---

# 113. `.env`

Cuando despleguemos contratos puede ser necesario utilizar secretos en variables de entorno.

Ejemplo conceptual:

```text
PRIVATE_KEY=...
```

El archivo:

```text
.env
```

debe normalmente estar excluido del repositorio mediante:

```text
.gitignore
```

---

# 114. `.env` no es una bóveda perfecta

Guardar secretos en `.env` evita hardcodearlos y publicarlos accidentalmente, pero no convierte automáticamente el equipo en seguro.

Malware o software con acceso al sistema podría seguir leyendo el archivo.

Para producción pueden utilizarse sistemas de gestión de secretos más robustos.

---

# 115. Nunca hardcodees la clave

Evita:

```javascript
const privateKey =
    "0x...";
```

especialmente dentro de código destinado a Git.

Porque:

```text
git commit
↓
git history
↓
secret may remain
```

aunque posteriormente borres la línea.

---

# 116. Git History

Si accidentalmente haces commit de una private key:

```text
removing the latest line
```

no es suficiente.

La clave puede permanecer en:

```text
Git history
```

Si una clave real ha sido expuesta debemos considerarla comprometida y migrar los fondos/permisos a una clave nueva.

---

# 117. Nunca reutilices claves comprometidas

Si una private key se hace pública:

```text
Private Key
↓
Compromised
```

No debemos:

```text
"cambiar la contraseña"
```

y continuar utilizándola.

La clave misma está comprometida.

Debemos migrar a otra cuenta.

---

# 118. Backups

Una estrategia segura necesita considerar:

```text
What if my device dies?
```

Por eso debemos tener backups adecuados de la información de recuperación.

Pero estos backups también deben protegerse contra:

* robo;
* fuego;
* pérdida;
* fotografías;
* nube comprometida;
* acceso físico.

---

# 119. No fotografíes la seed phrase

Guardar la seed en:

```text
Gallery
```

o:

```text
Cloud Photos
```

aumenta la superficie de ataque.

Una copia digital puede terminar sincronizada en múltiples dispositivos y servicios.

---

# 120. No guardes secretos en chats

Evita enviar:

```text
Private Key
```

o:

```text
Seed Phrase
```

mediante mensajería.

Puede existir:

* historial;
* backups;
* dispositivos vinculados;
* capturas;
* compromisos de cuenta.

---

# 121. Wallet Password Manager

Un password manager puede ser útil para contraseñas convencionales.

Pero una seed phrase tiene implicaciones especiales.

Cada estrategia de almacenamiento debe evaluarse según el riesgo y el modelo de amenaza.

Para fondos importantes se recomienda comprender bien la seguridad antes de improvisar soluciones.

---

# 122. Physical Security

Una hardware wallet también puede requerir proteger:

```text
physical device
```

y:

```text
recovery backup
```

La seguridad no es únicamente digital.

---

# 123. Transaction Security

Antes de firmar una transacción podemos aplicar una checklist:

```text
¿Estoy en la red correcta?

¿Reconozco la dApp?

¿El dominio es correcto?

¿El contrato es correcto?

¿La función es la esperada?

¿La cantidad es correcta?

¿Estoy enviando ETH?

¿Estoy dando approval?

¿A quién estoy autorizando?

¿Cuánto gas voy a pagar?
```

---

# 124. Signature Security

Antes de firmar un mensaje:

```text
¿Quién lo solicita?

¿Qué estoy firmando?

¿Tiene expiration?

¿Contiene nonce?

¿Puede autorizar movimientos?

¿Es un permit?

¿Es una order?
```

No debemos asumir que:

```text
"No gas"
=
"No risk"
```

---

# 125. Wallet y EIP-712

Más adelante encontraremos firmas estructuradas mediante:

```text
EIP-712
```

Estas permiten presentar datos de forma más comprensible.

Conceptualmente:

```text
Structured Data
↓
Wallet
↓
Human-readable fields
↓
Signature
```

Será un tema más avanzado.

---

# 126. Permit

Algunos tokens permiten crear approvals mediante firmas.

Conceptualmente:

```text
Alice
↓
Sign Permit
↓
Relayer / Contract
↓
Allowance
```

En este caso una firma off-chain puede terminar concediendo permisos on-chain.

Por eso:

```text
signature
```

también puede ser económicamente importante.

---

# 127. Replay Attack

Un:

```text
replay attack
```

ocurre cuando una firma válida se intenta reutilizar en otro contexto donde no debería ser válida.

Por eso los sistemas de firmas suelen incluir elementos como:

```text
chainId

nonce

deadline

contract address
```

dependiendo del protocolo.

---

# 128. Nonce en mensajes

Los nonces no aparecen únicamente en transacciones.

Los protocolos pueden utilizar sus propios nonces para firmas.

Conceptualmente:

```text
Message 1
nonce = 1
```

```text
Message 2
nonce = 2
```

para impedir reutilizaciones.

---

# 129. Expiration

Firmas avanzadas pueden incluir:

```text
deadline
```

o:

```text
expiration
```

para limitar cuánto tiempo son válidas.

Esto reduce ciertos riesgos de reutilización futura.

---

# 130. Wallet Security Model

Podemos pensar la seguridad de una wallet en capas:

```text
Wallet Security
│
├── Private Key Security
├── Seed Security
├── Device Security
├── Transaction Review
├── dApp Security
├── Network Verification
└── Operational Security
```

No basta con proteger únicamente la clave.

---

# 131. Self-Custody

Cuando controlamos directamente las claves hablamos frecuentemente de:

```text
self-custody
```

Esto ofrece control.

Pero también responsabilidad.

No existe necesariamente un soporte central capaz de revertir errores.

---

# 132. Seguridad y cantidades

Una estrategia razonable puede separar fondos según su uso.

Por ejemplo:

```text
Daily Wallet
↓
small balance
```

```text
Development Wallet
↓
test funds
```

```text
Long-term Storage
↓
different security model
```

Así una sola clave comprometida no expone todo.

---

# 133. Wallet para deploy

Cuando despleguemos contratos con Hardhat tendremos una cuenta:

```text
Deployer
```

Conceptualmente:

```text
Deployer Wallet
↓
Private Key
↓
Hardhat
↓
Deploy Transaction
```

La cuenta pagará el gas del deployment.

---

# 134. Deployer puede ser especial

La dirección que despliega un contrato puede tener importancia.

Por ejemplo un constructor puede hacer:

```solidity
owner = msg.sender;
```

Entonces:

```text
Deployer
↓
becomes owner
```

Por eso debemos saber exactamente qué cuenta está realizando el deployment.

---

# 135. Admin Wallet

Contratos pueden tener una cuenta administrativa capaz de:

* pausar;
* actualizar;
* hacer mint;
* cambiar parámetros;
* retirar fondos.

Utilizar una sola hot wallet para estas capacidades puede ser peligroso.

En producción pueden utilizarse mecanismos como:

```text
Multisig
```

o:

```text
Timelock
```

dependiendo del diseño.

---

# 136. Timelock

Un:

```text
timelock
```

puede introducir un retraso antes de ejecutar ciertas operaciones.

Conceptualmente:

```text
Admin proposes action
↓
Wait
↓
Execute
```

Esto puede ofrecer tiempo para revisar cambios importantes.

---

# 137. DAO Wallets

Una DAO puede administrar fondos mediante:

```text
Governance
↓
Multisig / Smart Contract
↓
Treasury
```

En estos casos la palabra:

```text
wallet
```

puede referirse a una arquitectura mucho más compleja que una simple EOA.

---

# 138. WalletConnect y conexiones externas

Las wallets también pueden conectarse a aplicaciones mediante protocolos de conexión.

Conceptualmente:

```text
DApp
↓
Connection Protocol
↓
Mobile Wallet
↓
User Approval
```

La idea sigue siendo la misma:

```text
dApp requests
↓
wallet shows
↓
user authorizes
```

---

# 139. Revocar conexión ≠ Revocar Approval

Este punto es importante.

Si desconectas una dApp de la wallet:

```text
Disconnect
```

puedes eliminar la conexión de interfaz.

Pero un:

```text
ERC-20 approval
```

ya registrado on-chain puede seguir existiendo.

Por tanto:

```text
Disconnect dApp
≠
Revoke token approval
```

---

# 140. On-chain Permissions

Los permisos registrados mediante contratos existen en:

```text
blockchain state
```

No en la lista local de conexiones de la wallet.

Para eliminarlos puede ser necesaria una:

```text
on-chain transaction
```

---

# 141. Wallet Address Privacy

Aunque una address no muestre directamente tu nombre, su actividad suele ser pública.

Si utilizas la misma address para todo:

```text
payments

DeFi

NFTs

salary

donations
```

puede construirse un historial público de actividad.

---

# 142. Pseudonymity

Ethereum es mejor descrito normalmente como:

```text
pseudonymous
```

y no:

```text
anonymous
```

Las addresses son seudónimos públicos con historial observable.

---

# 143. Linking Identity

Si una address se relaciona con tu identidad real mediante:

* exchange KYC;
* ENS;
* publicación pública;
* pago;
* perfil;

parte de su historial puede quedar asociada contigo.

---

# 144. Crear otra address no garantiza privacidad

Aunque puedes derivar múltiples cuentas, los movimientos entre ellas y otros patrones pueden revelar relaciones.

La privacidad blockchain es un tema complejo.

---

# 145. Wallet y Smart Contract Risk

Una wallet segura puede interactuar con un contrato inseguro.

```text
Secure Wallet
↓
Vulnerable Contract
↓
Loss
```

Por tanto debemos distinguir:

```text
Key Security
```

de:

```text
Smart Contract Security
```

---

# 146. Wallet y Frontend Risk

También puede ocurrir:

```text
Safe Contract
↓
Compromised Frontend
↓
Malicious Transaction Request
```

El smart contract original podría ser legítimo, pero el frontend podría intentar dirigir al usuario hacia otra address.

---

# 147. Wallet y RPC Risk

Una wallet depende también de infraestructura RPC para obtener información.

Conceptualmente:

```text
Wallet
↓
RPC Provider
↓
Network
```

Un proveedor defectuoso puede afectar lo que muestra la interfaz.

Por eso sistemas críticos pueden utilizar mecanismos adicionales de verificación.

---

# 148. Wallet no es Blockchain

Si MetaMask u otra interfaz falla:

```text
Wallet UI unavailable
```

Ethereum puede seguir funcionando perfectamente.

Tus activos siguen en:

```text
Blockchain
```

La wallet es una herramienta de acceso.

---

# 149. Wallet no es la cuenta

Si eliminas una wallet del navegador:

```text
Wallet Extension Removed
```

la cuenta blockchain no desaparece.

Si conservas correctamente las claves puedes restaurar el acceso.

---

# 150. Wallet no es una Address

Una wallet puede contener muchas addresses.

```text
Wallet
│
├── 0xAAA
├── 0xBBB
├── 0xCCC
└── 0xDDD
```

Por tanto:

```text
Wallet
≠
Address
```

---

# 151. Address no es identidad completa

La misma address puede aparecer en múltiples redes EVM.

```text
Ethereum
0xAAA
```

```text
Sepolia
0xAAA
```

```text
L2
0xAAA
```

Los estados siguen siendo independientes.

---

# 152. Wallet no conoce automáticamente todos los tokens

Una wallet puede utilizar:

* token lists;
* indexers;
* explorers;
* contratos conocidos;

para descubrir balances.

Puede existir un token asociado a tu address que la interfaz todavía no muestre.

---

# 153. Firmar desde Hardhat

Cuando utilicemos Hardhat podremos obtener cuentas de desarrollo.

Conceptualmente:

```javascript
const [alice, bob] =
    await ethers.getSigners();
```

Entonces:

```text
alice
↓
Signer
```

```text
bob
↓
Signer
```

Podremos ejecutar:

```text
transactions
```

desde cada uno.

---

# 154. `connect()`

Más adelante veremos patrones como:

```javascript
contract.connect(alice)
```

Esto significa conceptualmente:

```text
Use Alice as Signer
↓
Call Contract
```

Por tanto dentro del contrato:

```text
msg.sender
```

puede cambiar según el signer utilizado.

---

# 155. Ejemplo

Contrato:

```solidity
contract Example {

    address public lastCaller;

    function callMe() external {
        lastCaller = msg.sender;
    }
}
```

Si ejecutamos con Alice:

```text
Alice Signer
↓
callMe()
```

obtenemos:

```text
lastCaller = Alice
```

---

# 156. Otro Signer

Después:

```text
Bob Signer
↓
callMe()
```

resultado:

```text
lastCaller = Bob
```

Esto será fundamental en testing.

---

# 157. Wallets y Testing

Necesitaremos probar:

```text
Owner
```

```text
Non-owner
```

```text
Attacker
```

```text
User A
```

```text
User B
```

Hardhat nos permitirá representar cada actor mediante diferentes signers.

---

# 158. Ejemplo de Access Control

Contrato:

```solidity
require(
    msg.sender == owner,
    "Not owner"
);
```

Test:

```text
Owner Signer
↓
success
```

```text
Alice Signer
↓
revert
```

Este modelo se apoya completamente en entender wallets y firmas.

---

# 159. Wallets y Deployment

Cuando ejecutemos:

```text
Deploy
```

el signer será:

```text
Deployer
```

El deployment consume:

```text
ETH from deployer
```

y utiliza su:

```text
nonce
```

---

# 160. Wallets y Mainnet

Cuando pasemos de:

```text
Hardhat Local
```

a:

```text
Mainnet
```

las consecuencias cambian radicalmente.

En local:

```text
fake keys
fake ETH
```

En Mainnet:

```text
real keys
real ETH
real consequences
```

Por eso debemos mantener una separación mental muy clara.

---

# 161. Modelo completo de Wallet

```text
                       WALLET
                          │
             ┌────────────┼────────────┐
             │            │            │
          Accounts       Keys       Networks
             │            │            │
          Address     Private Key    Chain ID
                         │
                      Signature
                         │
                     Transaction
                         │
                        RPC
                         │
                      Ethereum
```

---

# 162. Modelo criptográfico

```text
Random Secret
↓
Private Key
↓
Public Key
↓
Address
```

Después:

```text
Transaction
+
Private Key
↓
Signature
↓
Network Verification
```

---

# 163. Modelo de recuperación

```text
Seed Phrase
↓
Key Derivation
│
├── Private Key A
│      ↓
│   Address A
│
├── Private Key B
│      ↓
│   Address B
│
└── Private Key C
       ↓
    Address C
```

---

# 164. Modelo de una dApp

```text
User
↓
DApp
↓
Connect Wallet
↓
Address
↓
Request Transaction
↓
Wallet
↓
Review
↓
Sign
↓
RPC
↓
Blockchain
```

---

# 165. Modelo de seguridad

```text
Private Key
↓
must remain secret
```

```text
Seed Phrase
↓
must remain secret
```

```text
Address
↓
can be public
```

```text
Signature
↓
must be reviewed
```

```text
Transaction
↓
must be understood
```

---

# 166. Errores comunes

## Error 1

```text
Wallet
=
lugar donde están mis monedas
```

Incorrecto.

Los balances existen en la blockchain.

---

## Error 2

```text
Wallet
=
Address
```

Incorrecto.

Una wallet puede administrar múltiples addresses.

---

## Error 3

```text
Private Key
=
Password
```

Incorrecto.

Una private key es una clave criptográfica con control directo sobre la cuenta.

---

## Error 4

```text
Seed Phrase
=
Private Key
```

No exactamente.

Una seed puede derivar múltiples private keys.

---

## Error 5

```text
Connect Wallet
=
dar acceso a mis fondos
```

No automáticamente.

Conectar y conceder approvals son acciones diferentes.

---

## Error 6

```text
Disconnect
=
revoke approvals
```

Incorrecto.

Los approvals on-chain pueden seguir existiendo.

---

## Error 7

```text
Hardware Wallet
=
imposible perder fondos
```

Incorrecto.

Todavía puedes firmar una transacción maliciosa.

---

## Error 8

```text
Sign Message
=
sin riesgo porque no cuesta gas
```

Incorrecto.

Una firma puede conceder autorizaciones importantes.

---

## Error 9

```text
Same Address
=
same balance everywhere
```

Incorrecto.

Cada red mantiene su propio estado.

---

## Error 10

```text
Deleting Wallet
=
deleting account from blockchain
```

Incorrecto.

La blockchain continúa existiendo.

---

## Error 11

```text
Import Token
=
receiving tokens
```

Incorrecto.

Solo hace que la interfaz reconozca/muestre determinado contrato.

---

## Error 12

```text
Wallet password
=
seed phrase
```

Incorrecto.

Cumplen funciones diferentes.

---

## Error 13

```text
Private key committed to Git
=
safe after deleting line
```

Incorrecto.

Puede permanecer en el historial.

---

## Error 14

```text
Verified contract
=
safe transaction
```

Incorrecto.

Siempre debemos revisar qué operación estamos autorizando.

---

## Error 15

```text
Address looks similar
=
same address
```

Incorrecto.

Las addresses deben verificarse cuidadosamente.

---

# 167. Checklist de seguridad

Antes de utilizar una wallet con fondos reales:

```text
¿La wallet proviene de una fuente confiable?

¿Mi seed phrase está respaldada?

¿El backup está protegido?

¿La seed nunca ha sido compartida?

¿Mi dispositivo es confiable?

¿Estoy usando la red correcta?

¿El dominio de la dApp es correcto?

¿Comprendo la transacción?

¿Comprendo los approvals?

¿La address de destino es correcta?

¿Estoy firmando un mensaje o una transaction?

¿Estoy usando una wallet separada para desarrollo?
```

---

# 168. Checklist para desarrolladores

Durante este repositorio:

```text
Nunca usar private keys reales en ejemplos
```

```text
Nunca commit .env
```

```text
Nunca enviar fondos reales a cuentas Hardhat públicas
```

```text
Separar development wallet
```

```text
Verificar chainId antes de deploy
```

```text
Verificar deployer address
```

```text
Verificar balance del deployer
```

```text
Revisar permisos administrativos
```

---

# 169. Preguntas de repaso

Intenta responder:

1. ¿Qué es una wallet?
2. ¿Dónde existen realmente tus ETH?
3. ¿Qué diferencia existe entre wallet y account?
4. ¿Qué es una EOA?
5. ¿Qué es una private key?
6. ¿Puede compartirse una private key?
7. ¿Qué es una public key?
8. ¿Cómo se relacionan private key, public key y address?
9. ¿Puede compartirse una address?
10. ¿Qué es una firma digital?
11. ¿Ethereum necesita recibir nuestra private key?
12. ¿Qué es un signer?
13. ¿Qué diferencia existe entre provider y signer?
14. ¿Qué es una software wallet?
15. ¿Qué es una hardware wallet?
16. ¿Qué es una seed phrase?
17. ¿Seed phrase y private key son lo mismo?
18. ¿Qué es una HD Wallet?
19. ¿Qué es un derivation path?
20. ¿Qué diferencia existe entre password y seed phrase?
21. ¿Qué significa custodial?
22. ¿Qué significa non-custodial?
23. ¿Qué es una multisig?
24. ¿Qué es una smart contract wallet?
25. ¿Cambiar de red mueve fondos?
26. ¿Qué relación existe entre wallet y chainId?
27. ¿Qué ocurre cuando conectamos una wallet a una dApp?
28. ¿Connect Wallet concede automáticamente permiso de gasto?
29. ¿Firmar un mensaje consume necesariamente gas?
30. ¿Una firma sin gas puede ser peligrosa?
31. ¿Qué significa blind signing?
32. ¿Qué es phishing?
33. ¿Por qué debemos verificar la address de destino?
34. ¿Qué es address poisoning?
35. ¿Qué es una burner wallet?
36. ¿Qué diferencia existe entre hot y cold wallet?
37. ¿Qué es una development wallet?
38. ¿Por qué no debemos utilizar cuentas Hardhat con dinero real?
39. ¿Para qué sirve `.env`?
40. ¿`.env` convierte una private key en completamente segura?
41. ¿Qué hacemos si una private key real se publica?
42. ¿Disconnect Wallet revoca approvals?
43. ¿Qué es un infinite approval?
44. ¿Por qué una hardware wallet no elimina todos los riesgos?
45. ¿Qué significa self-custody?
46. ¿Qué significa pseudonymous?
47. ¿Qué es un deployer?
48. ¿Por qué importa qué wallet despliega un contrato?
49. ¿Qué significa `contract.connect(alice)`?
50. ¿Cómo afecta el signer a `msg.sender`?

---

# 170. Lo que todavía NO necesitas dominar

Todavía no necesitas entender en profundidad:

```text
BIP-32

BIP-39

BIP-44

Derivation path internals

ECDSA mathematics

secp256k1 internals

Signature malleability

EIP-712 internals

ERC-4337

UserOperations

Bundlers

Paymasters

Session Keys

Passkeys

MPC wallets

Threshold signatures

Shamir Secret Sharing

Social Recovery

Hardware secure elements

Air-gapped signing protocols
```

Estos conceptos tendrán más sentido después de trabajar con wallets reales, Solidity y Hardhat.

---

# 171. Conceptos que debes recordar

### Wallet

Herramienta para administrar claves, cuentas y firmas.

### Private Key

Secreto criptográfico utilizado para firmar.

### Public Key

Información derivada de la private key utilizada dentro del esquema criptográfico.

### Address

Identificador público de una cuenta.

### Seed Phrase

Información de recuperación desde la cual pueden derivarse múltiples claves.

### Signer

Entidad capaz de firmar.

### Provider

Conexión con una red blockchain.

### Software Wallet

Wallet ejecutada mediante software.

### Hardware Wallet

Dispositivo especializado para aislar claves.

### Custodial

Un tercero controla las claves.

### Non-Custodial

El usuario controla las claves.

### Multisig

Wallet o sistema que requiere múltiples autorizaciones.

### Approval

Permiso on-chain que puede permitir a otro contrato mover tokens.

---

# 172. Relación con Ethereum

Ethereum mantiene:

```text
State
```

La wallet administra:

```text
Keys
```

Las claves producen:

```text
Signatures
```

Las firmas autorizan:

```text
Transactions
```

Las transacciones modifican:

```text
State
```

Por tanto:

```text
Wallet
↓
Private Key
↓
Signature
↓
Transaction
↓
Ethereum
↓
New State
```

---

# 173. Relación con transacciones

En:

```text
transacciones.md
```

vimos:

```text
Transaction
↓
Sign
↓
Broadcast
↓
Block
↓
EVM
```

La wallet es la herramienta que normalmente realiza los primeros pasos:

```text
Build
↓
Review
↓
Sign
↓
Broadcast
```

---

# 174. Relación con redes

```text
Wallet
↓
Select Network
↓
chainId
↓
RPC
↓
Node
```

La misma wallet puede observar diferentes estados dependiendo de la red.

---

# 175. Relación con tokens

Para mover un ERC-20:

```text
Wallet
↓
Sign Transaction
↓
Token Contract
↓
transfer()
```

Para dar permiso:

```text
Wallet
↓
Sign Transaction
↓
Token Contract
↓
approve()
```

Por eso comprender wallets es fundamental para entender tokens y DeFi.

---

# 176. Relación con Hardhat

Hardhat nos permitirá trabajar con:

```text
Signers
```

que representan cuentas.

Conceptualmente:

```text
Hardhat
│
├── Alice Signer
├── Bob Signer
├── Carol Signer
└── Deployer Signer
```

Cada uno podrá ejecutar transacciones diferentes.

---

# 177. Mapa mental final

```text
                         USER
                          │
                        WALLET
                          │
              ┌───────────┼───────────┐
              │           │           │
            Keys       Accounts     Networks
              │           │           │
        Private Key     Address     chainId
              │
              ▼
          Signature
              │
              ▼
         Transaction
              │
              ▼
             RPC
              │
              ▼
            Node
              │
              ▼
          Ethereum
              │
              ▼
             EVM
              │
              ▼
        Smart Contract
              │
              ▼
          New State
```

---

# 178. Modelo de seguridad final

```text
Seed Phrase
↓
derives keys
↓
Private Key
↓
controls signing
↓
Signature
↓
authorizes action
↓
Transaction
↓
can move real value
```

Por eso:

```text
Protect Seed
```

```text
Protect Private Keys
```

```text
Review Signatures
```

```text
Review Transactions
```

son cuatro responsabilidades distintas.

---

# 179. Regla mental definitiva

Cuando utilices una wallet piensa:

```text
Wallet
≠
Funds
```

```text
Wallet
=
Key Manager + Signer + User Interface
```

Los fondos existen:

```text
On-chain
```

La wallet controla:

```text
Keys
```

Y las keys permiten producir:

```text
Signatures
```

que pueden autorizar:

```text
Transactions
```

---

# 180. Cierre de fundamentos blockchain

Con este archivo ya podemos conectar todo el módulo:

```text
Ethereum
↓
Blockchain programable
```

```text
Networks
↓
Dónde existe el estado
```

```text
Wallet
↓
Quién puede autorizar
```

```text
Transaction
↓
Qué solicita el cambio
```

```text
EVM
↓
Quién ejecuta
```

```text
Gas
↓
Cómo se mide el trabajo
```

```text
Tokens
↓
Activos implementados mediante contratos
```

Todo junto:

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
Network
↓
EVM
↓
Smart Contract
↓
Gas
↓
State Change
```

Este es el modelo mental fundamental que necesitaremos antes de empezar a programar contratos.

---

# Resumen

Una wallet no almacena literalmente tus activos.

Ethereum mantiene:

```text
balances

ownership

contract state
```

La wallet mantiene o utiliza las claves necesarias para autorizar operaciones.

La relación fundamental es:

```text
Private Key
↓
Public Key
↓
Address
```

Y para ejecutar una acción:

```text
Transaction
+
Private Key
↓
Signature
↓
Ethereum
```

Una seed phrase puede permitir derivar múltiples claves:

```text
Seed Phrase
↓
Private Keys
↓
Addresses
```

Debemos distinguir:

```text
Wallet
≠
Address
```

```text
Wallet
≠
Blockchain
```

```text
Password
≠
Private Key
```

```text
Seed Phrase
≠
Address
```

```text
Connect Wallet
≠
Approve Tokens
```

```text
Disconnect Wallet
≠
Revoke Approvals
```

```text
Sign Message
≠
Send Transaction
```

```text
Hardware Wallet
≠
Zero Risk
```

La cadena más importante es:

```text
User
↓
Wallet
↓
Signer
↓
Signature
↓
Transaction
↓
RPC
↓
Ethereum
↓
EVM
↓
Smart Contract
↓
New State
```

Con esto queda completada la base conceptual necesaria para avanzar desde:

```text
00-fundamentos-blockchain/
```

hacia:

```text
01-fundamentos-solidity/
```

y comenzar a escribir nuestros primeros smart contracts.
