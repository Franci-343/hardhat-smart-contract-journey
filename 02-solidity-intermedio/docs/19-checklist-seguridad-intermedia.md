# 19 - Checklist de seguridad intermedia

En Solidity los errores **cuestan dinero** y no se pueden corregir con un parche: el codigo desplegado es publico e (normalmente) inmutable. Esta leccion reune lo que aprendiste en el modulo en forma de checklist que puedes aplicar a cualquier contrato antes de desplegarlo.

No sustituye a una auditoria profesional. Sirve para **no llegar a ella con errores evitables**. El modulo 03 profundiza en cada tema.

## Como usar esta leccion

1. Recorre las secciones con tu contrato abierto.
2. Para cada punto, pregunta: "hay una funcion mia donde esto pueda pasar?".
3. Si la respuesta es "no lo se", tienes un test pendiente.

## 1. Control de acceso (lecciones 12 y 13)

- [ ] Cada funcion `external`/`public` que cambia estado tiene una razon clara para poder ser llamada por quien puede llamarla.
- [ ] Las funciones administrativas (`mint`, `pause`, `withdraw`, `setFee`...) estan protegidas.
- [ ] Autorizas con `msg.sender`, **nunca** con `tx.origin` (leccion 09).
- [ ] El `owner` o admin es una **multisig**, no una cuenta personal, en cualquier despliegue con valor.
- [ ] La transferencia de propiedad es en dos pasos.
- [ ] Ningun rol amplio esta asignado por defecto a mas cuentas de las necesarias.
- [ ] Sabes que pasa si el owner pierde su clave privada.
- [ ] Un usuario puede saber, leyendo el contrato, que puede hacer el admin.

## 2. Llamadas externas y reentrada (lecciones 06, 09 y 10)

- [ ] Sigues **checks-effects-interactions**: validas, actualizas estado, y **luego** llamas a otros contratos o envias ETH.
- [ ] Las funciones que envian ETH o llaman a contratos externos usan un guard `noReentrante`.
- [ ] Revisas el booleano de retorno de cada `call` (`(bool ok, ) = ...; if (!ok) revert`).
- [ ] Envias ETH con `call{value: ...}("")`, no con `transfer`/`send`.
- [ ] Ningun bucle llama a contratos externos sin un limite claro.
- [ ] No asumes que una direccion recibida como parametro es honesta.
- [ ] Usas `abi.encodeCall` en lugar de firmas en texto.
- [ ] Pensaste que pasa si la llamada externa **revierte** o **gasta todo el gas**.

## 3. Datos externos y oraculos (leccion 16)

- [ ] Validas que el precio sea mayor que cero.
- [ ] Validas la **antiguedad** del dato (`updatedAt`).
- [ ] Usas `decimals()` en vez de suponerlos.
- [ ] Usas la direccion de feed correcta para **cada red**.
- [ ] No usas el precio "spot" de un unico pool de un exchange como fuente de verdad.
- [ ] Sabes que pasa con tu contrato si el oraculo se cae.

## 4. Tokens (lecciones 14 y 15)

- [ ] El `mint` esta restringido, y sabes cual es el suministro maximo.
- [ ] Transferencias a `address(0)` rechazadas.
- [ ] Manejas los decimales correctamente (`parseUnits`, no numeros magicos).
- [ ] Al recibir tokens de terceros, considera tokens no estandar (sin retorno `bool`, con comisiones): usa `SafeERC20`.
- [ ] Los permisos infinitos (`type(uint256).max`) son decision consciente.
- [ ] En NFTs, prefieres `safeTransferFrom`/`safeMint` cuando el destino puede ser un contrato.
- [ ] La metadata de un NFT esta en almacenamiento que no cambia sin que el dueno lo sepa (IPFS/Arweave).

## 5. Aritmetica y datos

- [ ] Multiplicas **antes** de dividir para no perder precision (leccion 05: `(valor * bps) / 10_000`).
- [ ] Conoces el efecto de la division entera (`5 / 2 == 2`).
- [ ] Usas `unchecked` **solo** cuando puedes demostrar que no hay overflow.
- [ ] No hay bucles sobre arrays que **pueden crecer sin limite**: un usuario podria hacer el bucle tan caro que nadie pueda ejecutarlo (ataque de denegacion de servicio por gas).
- [ ] Validas los parametros de entrada (rangos, direcciones cero, longitudes).

## 6. Estado, tiempo y azar

- [ ] Recuerdas que **`private` no es secreto**: cualquiera puede leer el storage de un contrato. Nunca guardes contrasenas ni claves ahi.
- [ ] `block.timestamp` puede variar unos segundos; no la uses para decisiones de precision fina ni como fuente de azar.
- [ ] No generas numeros "aleatorios" con `block.timestamp`, `blockhash` o `prevrandao`: son predecibles o manipulables. Usa un oraculo de aleatoriedad verificable (como Chainlink VRF).
- [ ] Cambios importantes de estado emiten **eventos**.
- [ ] Usas `immutable`/`constant` para lo que no cambia (leccion 07).
- [ ] Sabes si un dato esta en `storage`, `memory` o `calldata`, y por que (leccion 08).

## 7. Pausas y emergencias (leccion 13)

- [ ] Existe un plan si se descubre un bug: como se detecta, quien decide, como se comunica.
- [ ] Si hay pausa, sabes **quien** puede pausar y que pasa con los fondos de los usuarios mientras tanto.
- [ ] Ningun poder de emergencia permite al owner llevarse los fondos de los usuarios sin limites o retraso.

## 8. Pruebas

- [ ] Cada funcion tiene al menos un test del **camino feliz**.
- [ ] Cada `revert` tiene un test que lo provoca.
- [ ] Probaste con **cuentas distintas** (owner, usuario normal, atacante).
- [ ] Probaste los **valores limite**: `0`, `1`, `type(uint256).max`, arrays vacios.
- [ ] Simulaste un contrato atacante (como `AtacanteReentrada` en la leccion 06).
- [ ] Mediste la cobertura y el gas:

```bash
npx hardhat test --coverage
npx hardhat test --gas-stats
```

- [ ] Lees el codigo tal como lo haria un atacante: "como podria abusar de esta funcion?".

## 9. Despliegue y operacion

- [ ] Desplegaste **primero en local y luego en Sepolia**.
- [ ] Usas una cuenta de despliegue exclusiva, con la **minima cantidad de fondos** necesaria.
- [ ] `.env` no esta en Git (`git status` lo confirma).
- [ ] Ninguna clave privada, seed phrase o URL con API key aparece en el codigo, en los logs o en capturas.
- [ ] Guardaste la **direccion**, el **commit** y la **configuracion del compilador** del despliegue.
- [ ] Verificaste el contrato en Etherscan (leccion 18).
- [ ] Comprobaste que el **owner** y los **parametros** iniciales son los esperados, leyendolos de Etherscan.
- [ ] Probaste las funciones principales en Sepolia, con una cuenta distinta a la del despliegue.
- [ ] Si el contrato va a manejar valor real: **auditoria profesional** antes de mainnet.

## 10. Higiene personal

- [ ] Wallet de desarrollo separada de tu wallet personal.
- [ ] Nunca compartes tu seed phrase: **nadie legitimo te la pide**.
- [ ] Desconfias de mensajes que ofrecen "ETH gratis", soporte por privado o urgencia.
- [ ] Lees cada ventana de MetaMask antes de firmar: red, direccion y funcion.
- [ ] Revisas y revocas permisos (approvals) que ya no usas.

## Ejercicio: audita el propio modulo

Los contratos de este modulo son didacticos y **tienen decisiones que no serian aceptables en produccion**. Encuentra, con esta checklist, al menos estos puntos:

| Contrato | Que revisar |
| --- | --- |
| `ModifiersAvanzados` | `cambiarOwner` transfiere la propiedad en **un** solo paso |
| `BovedaSegura` | `retiroDeEmergencia` permite al owner vaciar el contrato |
| `ERC20Basico` | `mint` sin limite de suministro; `owner` no transferible |
| `ERC721Basico` | Solo el owner puede mintear; no hay `MAX_SUPPLY`; `tokenURI` sin validar |
| `ControlDeAcceso` | El ultimo admin puede renunciar y dejar los roles sin gestion |
| `AggregatorMock` | Cualquiera puede llamar `actualizarPrecio` (es solo un mock para pruebas) |
| `LlamadorBajoNivel` | Funciones de envio de ETH sin control de acceso |
| `FabricaContadores` | Crea contratos sin limite ni costo |

Para cada uno: describe el riesgo, propone la correccion y escribe un test que la verifique.

## Recursos para seguir

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts): implementaciones auditadas.
- [Solidity docs - Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html).
- [SWC Registry / Smart Contract Weakness Classification](https://swcregistry.io): catalogo de vulnerabilidades conocidas.
- [Damn Vulnerable DeFi](https://www.damnvulnerabledefi.xyz) y [Ethernaut](https://ethernaut.openzeppelin.com): retos para practicar ataques y defensas.

## Que sigue

El modulo **03 - Solidity avanzado** profundiza en: reentrancy (con ataques reales), control de acceso avanzado, front-running, optimizacion de gas, layout de storage, `delegatecall`, proxies y contratos actualizables.

## Resumen

- Revisa cada funcion publica: quien puede llamarla, que cambia y a quien llama.
- Protege el control de acceso, las llamadas externas, los oraculos y los tokens.
- Prueba con atacantes simulados, limites y varias cuentas.
- Despliega en local, luego en Sepolia, y solo con auditoria en mainnet.
- Cuida tus claves: la seguridad del contrato empieza por la seguridad de tu wallet.
