# 02 - Constructores y `super`

Cuando un contrato hereda de otro, hay dos preguntas:

1. Como se inicializa el padre, si su constructor pide argumentos?
2. Como reutilizo la version del padre de una funcion que estoy sobrescribiendo?

Archivos de esta leccion:

- `contracts/02-ConstructoresHerencia.sol`
- `test/02-ConstructoresHerencia.ts`
- `ignition/modules/02-ConstructoresHerencia.ts`
- `scripts/deploy-ConstructoresHerencia.ts`

## Constructor del padre con parametros

Si `Persona` pide argumentos:

```solidity
contract Persona {
    constructor(string memory nombre_, uint256 edad_) { ... }
}
```

el hijo **debe** pasarselos. Hay dos formas.

### Forma 1: en la firma del constructor del hijo

```solidity
contract Empleado is Persona {
    constructor(string memory nombre_, uint256 edad_, uint256 salario_)
        Persona(nombre_, edad_)
    {
        salario = salario_;
    }
}
```

Es la forma usada en este modulo porque los valores llegan como parametros al desplegar.

### Forma 2: en la lista de herencia

```solidity
contract Empleado is Persona("Ana", 30) { ... }
```

Solo sirve cuando los valores son fijos y conocidos al compilar. Casi nunca es lo que quieres.

Si no pasas los argumentos de ninguna de las dos formas, el contrato pasa a ser **abstracto** y no se puede desplegar (lo vemos en la leccion 03).

## Orden de ejecucion de los constructores

Los constructores se ejecutan **del mas base al mas derivado**, sin importar el orden en que escribas los argumentos:

```text
Persona -> Empleado -> Gerente
```

El contrato `Persona` de este modulo guarda ese orden en un array para que lo puedas comprobar:

```solidity
constructor(...) {
    _ordenConstruccion.push("Persona");
}
```

y cada hijo agrega su nombre con el helper `_registrar`. Al desplegar un `Gerente`:

```text
["Persona", "Empleado", "Gerente"]
```

Por eso, cuando el constructor del hijo empieza a ejecutarse, el padre **ya esta inicializado** y puedes usar sus variables.

## `super`: llamar a la version del padre

Al sobrescribir una funcion, muchas veces quieres **agregar** algo, no reemplazar todo:

```solidity
contract Empleado is Persona {
    function presentarse() public view virtual override returns (string memory) {
        return string.concat(super.presentarse(), " (empleado)");
    }
}
```

`super.presentarse()` ejecuta la funcion del padre inmediato. En una cadena:

```text
Gerente.presentarse()
   -> super.presentarse()   = Empleado.presentarse()
        -> super.presentarse() = Persona.presentarse()
```

Con los datos del test (`"Luis"`, area `"Ventas"`):

```text
Persona   -> "Luis"
Empleado  -> "Luis (empleado)"
Gerente   -> "Luis (empleado) de Ventas"
```

`super` sigue el orden de linearizacion de la herencia. Con un solo padre es el padre directo. Con varios padres puede ir al siguiente en la cadena, no necesariamente al que escribiste primero. Si quieres una version concreta, usa `NombreDelPadre.funcion()` como hicimos con `Volador.moverse()` en la leccion 01.

## Helpers `internal` para los hijos

`_registrar` es `internal`: los hijos lo pueden llamar, pero nadie desde fuera. Es un patron habitual: el padre expone herramientas para los hijos sin abrirlas al publico. La convencion es prefijar con `_` las funciones `internal` y `private`.

## Parametros con Ignition

En `ignition/modules/02-ConstructoresHerencia.ts` los argumentos salen de `m.getParameter`, con valores por defecto:

```ts
const nombre = m.getParameter("nombre", "Ana Perez");
const gerente = m.contract("Gerente", [nombre, edad, salario, area]);
```

Puedes cambiarlos con un archivo JSON:

```json
{
  "ConstructoresHerenciaModule": {
    "nombre": "Luis",
    "area": "Ventas"
  }
}
```

```bash
npx hardhat ignition deploy ignition/modules/02-ConstructoresHerencia.ts --network hardhatMainnet --parameters params.json
```

## Ejecutar el test

```bash
npx hardhat test test/02-ConstructoresHerencia.ts
```

## Errores comunes

### `Contract "Empleado" should be marked as abstract`

Falta pasar los argumentos al constructor del padre.

### Pasar los argumentos dos veces

Si pasas los argumentos del padre en la lista de herencia **y** en el constructor, el compilador se queja: solo se pueden especificar una vez.

### Suponer que el hijo se inicializa primero

No: el padre siempre va primero. No intentes leer datos del hijo dentro del constructor del padre: aun no existen.

## Ejercicios

1. Agrega un contrato `Director is Gerente` con un campo `presupuesto` y un `presentarse()` que use `super`.
2. Cambia el orden de los argumentos de `Empleado` y ajusta el test.
3. Predice, antes de ejecutar, el array `ordenConstruccion` del `Director`.

## Resumen

- El hijo pasa los argumentos al constructor del padre en su propia firma.
- Los constructores se ejecutan de padre a hijo.
- `super` llama a la version del padre y permite **extender** en lugar de reemplazar.
- Las funciones `internal` son la forma de compartir herramientas solo con los hijos.
