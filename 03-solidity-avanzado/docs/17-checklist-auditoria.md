# 17 - Checklist de auditoria y herramientas

Esta es la leccion final: un contrato para auditar de punta a punta, un checklist para recorrer todo lo que aprendiste en los modulos 02 y 03, y una mencion a las herramientas que se usan en auditorias reales.

Archivos de esta leccion:

- `contracts/17-ChecklistAuditoria.sol`
- `test/17-ChecklistAuditoria.ts`
- `ignition/modules/17-ChecklistAuditoria.ts`
- `scripts/deploy-ChecklistAuditoria.ts`

## El ejercicio: `ContratoParaAuditar`

Es un "cofre de staking" de apariencia normal: la gente deposita ETH, puede retirarlo, y el owner tiene funciones administrativas. Tiene **al menos 5 problemas de seguridad**, cada uno tomado de una leccion anterior de este curso. El test de esta leccion explota 3 de ellos como ejemplo de tecnica; encontrar (y explotar) los otros 2 es tu ejercicio antes de leer la seccion de soluciones, mas abajo.

Antes de seguir leyendo, abre `contracts/17-ChecklistAuditoria.sol` y revisa cada funcion `external`/`public` con esta pregunta:

> "Quien deberia poder llamar esto, y que pasa si alguien mal intencionado lo hace en el peor momento posible?"

## El checklist para usar en cualquier contrato

### Control de acceso

- [ ] Cada funcion que cambia estado sensible (dueno, balances de otros, configuracion) tiene una proteccion explicita (`require`, modifier).
- [ ] Ninguna autorizacion usa `tx.origin`.
- [ ] Las funciones de emergencia (pausa, retiro de emergencia) estan protegidas y su alcance esta acotado.

### Llamadas externas

- [ ] Cada funcion que hace una llamada externa (`call`, `delegatecall`, transferir un token) sigue el orden **checks-effects-interactions**.
- [ ] Las funciones que mueven fondos tienen un guard de reentrada, ademas del orden correcto.
- [ ] Se revisa el booleano de retorno de cada `call` de bajo nivel.

### Aritmetica

- [ ] Cada `unchecked` tiene una justificacion clara de por que el overflow/underflow es imposible.
- [ ] Las conversiones de tipo (`uint256` a un tipo mas chico) validan el rango antes de convertir, si el valor puede exceder el tipo destino.

### Storage y proxies (si aplica)

- [ ] Si el contrato es actualizable, cada nueva version SOLO agrega variables al final; nunca reordena ni elimina las existentes.
- [ ] `initialize()` esta protegido contra una segunda llamada, y la logica esta protegida contra ser inicializada directamente (sin proxy).
- [ ] Cualquier `delegatecall` a una direccion externa considera si esa direccion es confiable, y si el layout de storage coincide.

### Precios y oraculos

- [ ] Ningun precio usado para decisiones de valor viene del spot de un unico pool con poca liquidez.
- [ ] Los oraculos externos se validan: precio positivo, dato reciente (modulo 02, leccion 16).

### Front-running

- [ ] Ninguna operacion sensible revela informacion valiosa en texto plano antes de ejecutarse, sin un mecanismo de commit-reveal si corresponde.

### Estandares (ERC-20/721/1155/4626)

- [ ] Las transferencias a contratos usan las versiones "safe" cuando el destino puede no saber recibir el token.
- [ ] Un vault ERC-4626 tiene mitigacion contra el ataque de inflacion del primer deposito.
- [ ] Los permisos (`approve`, `setApprovalForAll`) se otorgan con conciencia de su alcance real.

## Herramientas de auditoria (mencion conceptual)

Este curso no instala estas herramientas (son binarios externos, con instalacion especifica por sistema operativo), pero vale la pena saber que hacen:

- **Slither**: un analizador estatico (lee el codigo sin ejecutarlo) que detecta automaticamente muchos de los patrones de esta lista: reentrancy, `tx.origin`, variables sin inicializar, funciones sin proteccion, entre decenas de otros detectores. Es rapido y es casi siempre el primer paso en cualquier auditoria real.
- **Foundry con fuzzing**: en vez de escribir casos de test especificos, se describe una PROPIEDAD que siempre debe cumplirse (por ejemplo, "el total de balances nunca supera el balance real del contrato") y la herramienta genera miles de entradas aleatorias tratando de romperla.
- **Echidna**: similar al fuzzing de Foundry, especializado en encontrar secuencias de llamadas que rompen invariantes.
- **Mythril**: ejecucion simbolica, explora caminos de codigo de forma mas exhaustiva que un analizador estatico simple, a costa de ser mas lento.

Ninguna herramienta reemplaza el pensamiento critico de este checklist: detectan patrones conocidos, pero un ataque nuevo (una combinacion de bugs que nadie catalogo todavia) requiere que una persona piense el sistema completo.

## Ejecutar el test

```bash
npx hardhat test test/17-ChecklistAuditoria.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ChecklistAuditoria.ts --network hardhatMainnet
```

---

## Solucion: los 5 bugs de `ContratoParaAuditar`

**No sigas leyendo si todavia no intentaste encontrarlos por tu cuenta.**

### 1. `cambiarOwner` sin proteccion (leccion 02)

```solidity
function cambiarOwner(address nuevoOwner) external {
    owner = nuevoOwner;
}
```

Cualquiera puede convertirse en el owner. Falta `require(msg.sender == owner, "No autorizado")`.

### 2. `retirar` vulnerable a reentrancy (leccion 01)

```solidity
function retirar(uint256 monto) external {
    require(balances[msg.sender] >= monto, "Saldo insuficiente");
    (bool ok, ) = msg.sender.call{value: monto}("");
    require(ok, "Envio fallido");
    balances[msg.sender] -= monto; // demasiado tarde
}
```

Interaccion antes de efecto. Se corrige poniendo la resta del balance ANTES del `call` (y, como defensa adicional, un guard de reentrada).

### 3. `retiroDeEmergencia` confia en `tx.origin` (leccion 02)

```solidity
function retiroDeEmergencia(address payable destino) external {
    require(tx.origin == owner, "No autorizado");
    ...
}
```

Un contrato de phishing puede hacer que el owner dispare este retiro sin darse cuenta. Se corrige cambiando `tx.origin` por `msg.sender`.

### 4. `otorgarRecompensa` usa `unchecked` sin justificacion (leccion 03)

```solidity
function otorgarRecompensa(address usuario, uint256 monto) external {
    require(msg.sender == owner, "No autorizado");
    unchecked {
        recompensas[usuario] += monto;
    }
}
```

Esta funcion SI tiene control de acceso (solo el owner la llama), pero el `unchecked` no tiene ninguna justificacion: si en algun momento `recompensas[usuario]` esta cerca de `type(uint256).max` y se suma algo mas, el valor da la vuelta y el usuario pierde TODAS sus recompensas acumuladas de un plumazo, sin ningun error que lo avise. En una auditoria, cualquier `unchecked` sin un comentario que explique por que es seguro es una bandera roja, incluso en una funcion que solo puede llamar un rol de confianza: los errores del admin tambien cuentan.

### 5. `valorColateralEnUsd` confia en el oraculo sin validar (lecciones 15 de este modulo y 16 del modulo 02)

```solidity
function valorColateralEnUsd(uint256 cantidadEth) external view returns (uint256) {
    int256 precio = oraculo.ultimoPrecio();
    return (cantidadEth * uint256(precio)) / 1e18;
}
```

No valida que `precio` sea positivo (si el oraculo devuelve 0 o negativo, `uint256(precio)` produce un numero absurdo o revierte de forma confusa) ni que el dato sea reciente. Se corrige aplicando exactamente las validaciones del modulo 02, leccion 16 (`PrecioInvalido`, `PrecioObsoleto`).

## Ejercicios

1. Escribe una version corregida completa de `ContratoParaAuditar` (podes llamarla `ContratoAuditado`) que solucione los 5 problemas, y un test que confirme que los 5 ataques ya no funcionan.
2. Para el bug 4, escribe un test que demuestre el overflow: otorga una recompensa cercana a `type(uint256).max`, luego otorga una segunda, y confirma que el resultado da la vuelta.
3. Para el bug 5, escribe un test que fije el precio del oraculo en `0` o en negativo, y confirma que `valorColateralEnUsd` da un resultado sin sentido en la version sin corregir.

## Resumen del checklist

Cuando termines de auditar un contrato, deberias poder responder que si a estas preguntas:

- Cada funcion sensible, tiene control de acceso explicito, verificado con `msg.sender`?
- Cada llamada externa, ocurre despues de actualizar el estado relevante?
- Cada `unchecked`, tiene una razon documentada por la que es imposible que falle?
- Cada precio usado para decisiones de valor, viene de una fuente que no se puede manipular en una sola transaccion?
- Cada contrato actualizable, preserva su layout de storage entre versiones?

Este es el final del camino de Solidity de este curso (modulos 01 a 03). Los proximos modulos (04 a 06) profundizan Hardhat: testing avanzado, despliegues, verificacion, y flujo de produccion completo.
