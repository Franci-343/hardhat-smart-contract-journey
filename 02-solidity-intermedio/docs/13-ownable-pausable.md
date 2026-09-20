# 13 - Ownable y pausas de emergencia

Dos patrones aparecen en casi todos los contratos reales:

- **Ownable**: un unico dueno con permisos especiales.
- **Pausable**: un interruptor para frenar el contrato ante una emergencia.

Archivos de esta leccion:

- `contracts/13-OwnablePausable.sol`
- `test/13-OwnablePausable.ts`
- `ignition/modules/13-OwnablePausable.ts`
- `scripts/deploy-OwnablePausable.ts`

## Ownable

```solidity
abstract contract Propietario {
    address public owner;

    modifier soloPropietario() {
        if (msg.sender != owner) revert NoEsPropietario(msg.sender);
        _;
    }
}
```

Es un contrato **abstracto** pensado para ser heredado (leccion 03). El que despliega queda como `owner`, y las funciones marcadas con `soloPropietario` solo las puede llamar el.

### Transferir la propiedad en dos pasos

Transferir con una sola funcion es peligroso:

```solidity
function transferirPropiedad(address nuevo) external { owner = nuevo; }   // riesgoso
```

Si escribes mal la direccion (una letra distinta, o una direccion sin clave), pierdes el control **para siempre**.

La solucion es el patron de **dos pasos**:

1. El dueno actual **propone** un sucesor: `proponerPropietario(nuevo)`.
2. El sucesor **acepta** desde su propia cuenta: `aceptarPropiedad()`.

```solidity
function proponerPropietario(address nuevo) external soloPropietario {
    pendingOwner = nuevo;
}

function aceptarPropiedad() external {
    if (msg.sender != pendingOwner) revert NoEsPendiente(msg.sender);
    owner = msg.sender;
    pendingOwner = address(0);
}
```

Si te equivocas de direccion, nadie puede aceptar, y el dueno original conserva el control. El test lo verifica: mientras Alice no acepta, el `owner` sigue siendo el original.

OpenZeppelin ofrece esto como `Ownable2Step`.

### Renunciar a la propiedad

```solidity
function renunciarPropiedad() external soloPropietario {
    owner = address(0);
}
```

Deja el contrato **sin dueno**: las funciones `soloPropietario` quedan bloqueadas para siempre. Es una forma de "soltar" un contrato cuando ya no necesita administracion (por ejemplo, para demostrar a los usuarios que nadie puede cambiarlo). Es **irreversible**.

## Pausable: el interruptor de emergencia

Si descubres un bug o un ataque en curso, quieres poder **detener** las funciones sensibles mientras investigas.

```solidity
abstract contract PausableBasico {
    bool public paused;

    modifier cuandoNoPausado() {
        if (paused) revert ContratoPausado();
        _;
    }

    modifier cuandoPausado() {
        if (!paused) revert ContratoNoPausado();
        _;
    }

    function _pausar() internal cuandoNoPausado { paused = true; ... }
    function _reanudar() internal cuandoPausado { paused = false; ... }
}
```

Fijate en dos decisiones de diseno:

- `_pausar` y `_reanudar` son **internal**: el contrato hijo decide **quien** puede llamarlos. La pausa no impone su propio control de acceso.
- Pausar dos veces revierte (`cuandoNoPausado`): asi los eventos `Pausado`/`Reanudado` siempre reflejan cambios reales.

## Combinar ambos: `BovedaSegura`

```solidity
contract BovedaSegura is Propietario, PausableBasico {
    function depositar() external payable cuandoNoPausado { ... }
    function retirar() external cuandoNoPausado { ... }

    function pausar() external soloPropietario { _pausar(); }
    function reanudar() external soloPropietario { _reanudar(); }
}
```

- Herencia multiple (leccion 01) con dos bases abstractas.
- Los usuarios depositan y retiran solo cuando el contrato esta activo.
- Solo el dueno puede pausar y reanudar.

## Retiro de emergencia

```solidity
function retiroDeEmergencia(address payable destino) external soloPropietario cuandoPausado { ... }
```

Solo funciona con el contrato **pausado**: el dueno envia los fondos a un lugar seguro. Fijate en la combinacion de modifiers `soloPropietario cuandoPausado`.

**Riesgo de centralizacion:** esta funcion permite al dueno llevarse todo el dinero de los usuarios. En un proyecto real seria una senal de alerta. Alternativas:

- Que el dueno sea una **multisig** con varios firmantes.
- Un **timelock**: los cambios sensibles se anuncian y ejecutan tras un retardo (por ejemplo, 48 horas), dando tiempo a salir.
- Permitir que **cada usuario retire lo suyo** aun en pausa (en este contrato, `retirar` se bloquea con la pausa: es una decision de diseno que debes evaluar).

Los contratos son didacticos: sirven para mostrar el patron y sus tensiones, no como plantilla lista para produccion.

## Cuando pausar y cuando no

Pausar es util para:

- Bugs criticos descubiertos despues del despliegue.
- Ataques en curso.
- Migraciones a una version nueva.

Pero tiene costos: los usuarios dependen de que el dueno actue con buena fe, y una pausa mal usada puede atrapar fondos. Muchos protocolos descentralizados deliberadamente **no** incluyen pausa.

## Ejecutar el test

```bash
npx hardhat test test/13-OwnablePausable.ts
```

El test esta agrupado con `describe` anidados: "propiedad en dos pasos" y "pausa de emergencia".

## Desplegar

```bash
npx hardhat run scripts/deploy-OwnablePausable.ts --network hardhatMainnet
```

## Errores comunes

### Dejar funciones sensibles sin `soloPropietario`

Un `pausar()` sin proteccion permite a cualquiera congelar tu contrato.

### Transferir la propiedad en un solo paso a una direccion mal copiada

Usa dos pasos y verifica la direccion.

### Renunciar por accidente

`renunciarPropiedad()` no se puede deshacer. Asegurate de que ya no necesitas ninguna funcion administrativa.

### Olvidar que el dueno es un punto unico de fallo

Si el dueno pierde su clave privada o es hackeado, el contrato queda bloqueado o en manos del atacante.

## Ejercicios

1. Agrega una funcion `cancelarPropuesta()` que deje `pendingOwner` en cero y comprueba que el sucesor ya no puede aceptar.
2. Modifica `retirar` para que los usuarios **si** puedan retirar cuando el contrato esta pausado. Que ventajas y riesgos tiene?
3. Agrega un limite de tiempo a `aceptarPropiedad`: si pasan 7 dias, la propuesta caduca.

## Resumen

- Ownable da control a un dueno; la transferencia en **dos pasos** evita perder el contrato por un error.
- Pausable permite frenar funciones sensibles en una emergencia.
- El dueno es un **punto unico de fallo**: usa multisig y timelock en proyectos reales.
- Combina ambos con herencia multiple y modifiers.
