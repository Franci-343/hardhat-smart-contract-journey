# 11 - Contratos actualizables (UUPS)

La leccion 10 mostro un proxy cuya logica de actualizacion (`actualizar()`) vive EN EL PROXY. UUPS (Universal Upgradeable Proxy Standard, EIP-1822) invierte eso: la logica de actualizacion vive en la IMPLEMENTACION. Esta leccion tambien muestra, con un ejemplo real, que pasa cuando una actualizacion rompe el layout de storage.

Archivos de esta leccion:

- `contracts/11-ProxyActualizable.sol`
- `test/11-ProxyActualizable.ts`
- `ignition/modules/11-ProxyActualizable.ts`
- `scripts/deploy-ProxyActualizable.ts`

## Por que no usar un constructor

```solidity
contract LogicaUUPS_V1 {
    address public owner;

    constructor(address ownerInicial) {
        owner = ownerInicial; // ESTO NO FUNCIONARIA COMO ESPERAS
    }
}
```

El constructor de `LogicaUUPS_V1` se ejecuta **una sola vez, en el momento en que se despliega la LOGICA**, y escribe en el storage de LA LOGICA (su propia direccion). El proxy, que es una direccion completamente distinta, nunca ve ese storage: el suyo arranca vacio. Si el owner se fijara en el constructor, cada proxy que usara esta implementacion "veria" `owner = address(0)`, porque nunca ejecuto ese constructor.

## La solucion: `initialize()` en vez de constructor

```solidity
function initialize(address ownerInicial) external inicializador {
    owner = ownerInicial;
}
```

`initialize()` es una funcion NORMAL, pensada para llamarse **a traves del proxy**, justo despues de desplegarlo (para que el `delegatecall` la ejecute contra el storage del proxy, que es el que realmente importa). Pero una funcion normal se puede llamar mas de una vez, y eso seria un desastre: cualquiera podria re-inicializar el contrato y convertirse en el owner.

## Protegiendo `initialize()`: el patron `inicializador`

```solidity
abstract contract BaseActualizable {
    bool private _inicializado;

    error YaInicializado();

    modifier inicializador() {
        if (_inicializado) revert YaInicializado();
        _inicializado = true;
        _;
    }

    constructor() {
        _inicializado = true;
    }
}
```

Dos cosas pasan aca, y es importante distinguirlas:

1. El **modifier** `inicializador` bloquea una segunda llamada a `initialize()` a traves del proxy: la primera vez marca `_inicializado = true` (en el storage del PROXY, porque se ejecuta via `delegatecall`); la segunda vez, revierte.
2. El **constructor** de `BaseActualizable` marca `_inicializado = true` en el storage DE LA LOGICA MISMA, en el momento en que la logica se despliega (sin proxy de por medio). Esto bloquea que alguien llame `initialize()` DIRECTAMENTE sobre la direccion de la logica, sin pasar por ningun proxy.

```ts
// A traves del proxy: funciona una vez, falla la segunda.
await proxyComoV1.write.initialize([alguien.account.address]); // revierte: YaInicializado (fue en el deploy)

// Directamente sobre la logica: bloqueado desde el constructor.
const v1 = await viem.deployContract("LogicaUUPS_V1");
await viem.assertions.revertWithCustomError(v1.write.initialize([alguien.account.address]), v1, "YaInicializado");
```

Por que importa el segundo caso: si alguien pudiera llamar `initialize()` directamente sobre la logica y convertirse en su "owner", y la logica tuviera alguna funcion peligrosa reservada al owner (como `upgradeTo`, mas abajo), podria usar esa funcion sobre la LOGICA misma de formas daninas para cualquier proxy que la use.

## `upgradeTo`: la logica de actualizacion vive en la implementacion

```solidity
function upgradeTo(address nuevaImplementacion) external {
    require(msg.sender == owner, "No autorizado");

    bytes32 slot = SLOT_IMPLEMENTACION;
    assembly {
        sstore(slot, nuevaImplementacion)
    }
}
```

Esta funcion esta escrita en `LogicaUUPS_V1`, pero cuando se ejecuta a traves del proxy (via `delegatecall`), el `sstore` escribe en el slot de implementacion **del proxy** (leccion 09: `delegatecall` usa el storage de quien llama). Esto es exactamente lo que distingue a UUPS: el proxy en si mismo no necesita saber nada sobre como actualizarse; toda esa logica (y su control de acceso) vive en cada version de la implementacion.

```ts
await proxyComoV1.write.upgradeTo([v2.address]);

const proxyComoV2 = await viem.getContractAt("LogicaUUPS_V2", proxy.address);
assert.equal(await proxyComoV2.read.valor(), 42n); // el estado sigue ahi
```

## El proxy UUPS es deliberadamente "tonto"

```solidity
contract ProxyUUPS {
    constructor(address implementacionInicial, bytes memory datosInicializacion) {
        // guarda la implementacion, y si hay datos, los usa para llamar
        // initialize() en el mismo momento del despliegue
    }

    fallback() external payable { _delegar(); }
}
```

Nota que `ProxyUUPS` **no tiene** ninguna funcion de actualizacion propia (a diferencia de `ProxyMinimo` en la leccion 10). Todo lo reenvia. La ventaja: el proxy nunca necesita actualizarse a si mismo para soportar nuevas formas de actualizar; toda esa flexibilidad vive en las implementaciones.

## El bug real: romper el layout entre versiones

```solidity
// V2 SEGURA: agrega una variable AL FINAL.
contract LogicaUUPS_V2 is BaseActualizable {
    address public owner; // mismo slot que en V1
    uint256 public valor; // mismo slot que en V1
    uint256 public extra; // nueva, al final
}

// V2 INSEGURA: inserta una variable en el MEDIO.
contract LogicaUUPS_V2Malo is BaseActualizable {
    address public owner;
    uint256 public nueva; // <- rompe el layout: `valor` se corre un slot
    uint256 public valor;
}
```

Si actualizas un proxy que ya tenia `valor = 42` (guardado en su slot correspondiente) a `LogicaUUPS_V2Malo`:

```ts
await proxyComoV1.write.establecer([42n]);
await proxyComoV1.write.upgradeTo([v2Malo.address]);

const proxyComoV2Malo = await viem.getContractAt("LogicaUUPS_V2Malo", proxy.address);

// El 42 que se guardo como "valor" ahora se lee bajo la etiqueta "nueva".
assert.equal(await proxyComoV2Malo.read.nueva(), 42n);

// Y lo que V2Malo llama "valor" es un slot que nunca se escribio.
assert.equal(await proxyComoV2Malo.read.valor(), 0n);
```

Nada revierte. No hay ningun error. Los datos simplemente se leen con la etiqueta equivocada, porque el slot fisico donde vive el "42" no cambio, pero el NOMBRE que cada version le da a ese slot si cambio.

## La regla de oro para actualizar contratos

**Nunca reordenes, elimines, ni cambies el tipo de una variable existente. Solo agrega variables nuevas AL FINAL.** Esta regla es tan importante en la practica que la mayoria de los equipos que trabajan con contratos actualizables mantienen un archivo o herramienta que compara automaticamente el layout de storage entre versiones antes de desplegar una actualizacion (por ejemplo, el plugin `@openzeppelin/hardhat-upgrades` lo hace por vos).

## Ejecutar el test

```bash
npx hardhat test test/11-ProxyActualizable.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-ProxyActualizable.ts --network hardhatMainnet
```

## Errores comunes

### Poner logica de inicializacion en el constructor de la implementacion

Nunca se ejecuta contra el storage del proxy. Usa `initialize()`.

### Olvidar deshabilitar `initialize()` en la direccion de la logica

Sin el constructor que llama `_inicializado = true`, cualquiera podria inicializar la logica directamente y, si tiene funciones peligrosas, explotarlas ahi.

### Insertar una variable en el medio "porque hace mas sentido ahi organizacionalmente"

El orden de las variables en el codigo fuente no es una cuestion de estilo en un contrato actualizable: es literalmente el mapa de que bytes de storage significan que. Cambiarlo corrompe datos existentes.

## Ejercicios

1. Escribe `LogicaUUPS_V3` que herede de `LogicaUUPS_V2` (en lugar de reescribir todo) y agregue una funcion mas, confirmando que el patron de herencia tambien preserva el layout.
2. Agrega un `require` en `upgradeTo` que compare que la nueva implementacion tenga al menos el mismo `code.length` minimo esperado (una validacion superficial, para pensar sus limites).
3. Investiga (fuera de este repositorio) que hace `@openzeppelin/hardhat-upgrades` para detectar automaticamente un layout incompatible antes de desplegar, y escribe en tus propias palabras como lo lograria.

## Resumen

- UUPS pone la logica de actualizacion (`upgradeTo`) DENTRO de la implementacion, no del proxy.
- `initialize()` sustituye al constructor para el estado que debe vivir en el proxy; hay que protegerlo contra una segunda llamada, y contra llamarlo directamente sobre la logica.
- El constructor de la implementacion SI se usa, pero solo para deshabilitar `initialize()` en la direccion de la logica misma.
- Agregar variables nuevas siempre al FINAL preserva el layout; insertarlas en el medio corrompe el estado existente sin ningun error visible.
