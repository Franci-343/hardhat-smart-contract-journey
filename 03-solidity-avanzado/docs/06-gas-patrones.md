# 06 - Gas II: patrones de codigo

Ademas del layout de storage (leccion 05), hay patrones de **como escribis el codigo** que cambian el gas sin cambiar el resultado. Esta leccion mide tres de los mas utiles.

Archivos de esta leccion:

- `contracts/06-GasPatrones.sol`
- `test/06-GasPatrones.ts`
- `ignition/modules/06-GasPatrones.ts`
- `scripts/deploy-GasPatrones.ts`

## 1. Cachear una lectura de storage que se repite en un loop

```solidity
// Vuelve a leer `numeros.length` DESDE STORAGE en cada vuelta.
function sumarSinCache() external view returns (uint256 total) {
    for (uint256 i = 0; i < numeros.length; i++) {
        total += numeros[i];
    }
}

// La longitud se lee UNA sola vez.
function sumarConCache() external view returns (uint256 total) {
    uint256 longitud = numeros.length;
    for (uint256 i = 0; i < longitud; i++) {
        total += numeros[i];
    }
}
```

`numeros.length` no cambia dentro del loop, pero `sumarSinCache` la vuelve a leer de storage en cada iteracion. La primera lectura de un slot es "fria" (mas cara); las siguientes en la misma transaccion son "calientes" (mas baratas), pero **siguen costando algo mas que cero**. Guardarla una vez en una variable local (que vive en memoria/pila, no en storage) elimina esas lecturas repetidas.

```text
Gas sin cachear la longitud: 76215
Gas cacheando la longitud:  74043
```

Con 20 elementos, la diferencia es chica pero consistente; con arrays mas grandes (o loops que se repiten muchas veces en distintas llamadas), se acumula.

## 2. El orden de `&&` y `||` (cortocircuito)

`&&` y `||` **cortocircuitan**: si el primer operando ya alcanza para decidir el resultado, el segundo ni se evalua.

```solidity
// Barato primero: si ya esta bloqueado, _verificacionCara() NUNCA se ejecuta.
function ordenBarato(address usuario) external view returns (bool) {
    return !bloqueados[usuario] && _verificacionCara();
}

// Caro primero: SIEMPRE paga el costo completo de _verificacionCara(),
// incluso cuando el resultado ya iba a ser false de todas formas.
function ordenCaro(address usuario) external view returns (bool) {
    return _verificacionCara() && !bloqueados[usuario];
}
```

`_verificacionCara()` simula un chequeo costoso (recorre un array de 50 elementos). Cuando el usuario ya esta bloqueado:

```ts
await contrato.write.bloquear([otro.account.address]);

// ordenBarato evita _verificacionCara(); ordenCaro la paga igual.
assert.ok(gasBarato < gasCaro);
```

**La regla practica:** en una cadena de condiciones con `&&`, pone primero la que sea mas barata Y mas probable que sea falsa (para `&&`) o mas probable que sea verdadera (para `||`). El orden no cambia el resultado logico, solo cuanto gas se gasta llegando a el.

## 3. `require` con string vs errores personalizados

Ya usaste errores personalizados en varios contratos de este curso. La comparacion justa no es "cuanto cuesta el chequeo en si" (cuesta lo mismo evaluar la condicion, sea `require` o `if`): es el **tamano del bytecode desplegado**.

```solidity
contract ErroresConString {
    function operacionA(uint256 x) external pure returns (uint256) {
        require(x > 0, "El valor debe ser mayor a cero");
        require(x < 1_000_000, "El valor es demasiado grande");
        return x * 2;
    }
}

contract ErroresConCustomError {
    error ValorInvalido(uint256 x);
    error ValorDemasiadoGrande(uint256 x);

    function operacionA(uint256 x) external pure returns (uint256) {
        if (x == 0) revert ValorInvalido(x);
        if (x >= 1_000_000) revert ValorDemasiadoGrande(x);
        return x * 2;
    }
}
```

Cada string de error queda grabado en el bytecode del contrato **para siempre**, sin importar si esa linea llega a ejecutarse o no. Un error personalizado solo necesita su selector (4 bytes) mas los argumentos, y ese selector se calcula una sola vez en la definicion, no se repite en cada uso.

```ts
const tamanoString = (artefactoString.deployedBytecode.length - 2) / 2;
const tamanoCustom = (artefactoCustom.deployedBytecode.length - 2) / 2;

assert.ok(tamanoCustom < tamanoString);
```

Un contrato mas chico cuesta menos gas para **desplegar**, y en redes donde el tamano del contrato importa (el limite de 24 KB por contrato en Ethereum), usar errores personalizados de forma consistente puede ser la diferencia entre entrar o no en ese limite.

## Cuando NO vale la pena micro-optimizar

Estas tres tecnicas son gratis en terminos de legibilidad (no hacen el codigo mas dificil de entender) y casi siempre vale la pena aplicarlas. Pero hay optimizaciones de gas mas agresivas (empaquetar variables de forma forzada, usar assembly en lugares no criticos) que **si** cuestan legibilidad y mantenibilidad. La regla general: optimiza primero lo que es gratis o casi gratis (cachear lecturas, ordenar condiciones, usar errores personalizados), y reserva las tecnicas mas invasivas para el codigo que de verdad se ejecuta con mucha frecuencia.

## Ejecutar el test

```bash
npx hardhat test test/06-GasPatrones.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-GasPatrones.ts --network hardhatMainnet
```

## Errores comunes

### Cachear una variable que SI cambia dentro del loop

Si el array puede crecer o achicarse DENTRO del mismo loop (por ejemplo, si el cuerpo del loop hace `push` o `pop`), cachear la longitud al principio puede hacer que el loop recorra de mas o de menos. Cachea solo lo que sabes que es constante durante el loop.

### Reordenar condiciones sin pensar la logica

Cambiar el orden de un `&&` o un `||` nunca deberia cambiar el RESULTADO (por las reglas de la logica booleana, `a && b` es igual a `b && a`). Si cambiar el orden cambia el resultado de tu programa, el problema no es el orden: es que una de las dos expresiones tiene efectos secundarios (modifica estado), y en ese caso el orden si importa por otra razon completamente distinta al gas.

### Mezclar `require` y errores personalizados sin un criterio

No hace falta migrar TODO a errores personalizados de golpe. Pero dentro de un mismo contrato, tener un criterio consistente (por ejemplo, "los errores de validacion de entrada usan errores personalizados con los valores involucrados") hace el codigo mas facil de seguir.

## Ejercicios

1. Agrega una tercera funcion `sumarConCacheYUnchecked` que combine el cacheo de longitud con `unchecked` en el incremento del indice (leccion 03), y mide el gas total contra las otras dos.
2. Escribe una funcion con TRES condiciones encadenadas con `&&`, donde cada una tiene un costo distinto, y ordenalas de la mas barata a la mas cara.
3. Convierte `ErroresConString` para que use errores personalizados CON argumentos (mostrando el valor invalido, como ya hace `ErroresConCustomError`), y compara el tamano de bytecode resultante.

## Resumen

- Cachear en una variable local una lectura de storage que se repite sin cambiar en un loop ahorra gas de forma directa.
- `&&` y `||` cortocircuitan: ordenar la condicion mas barata primero evita pagar por chequeos innecesarios.
- Los errores personalizados generan bytecode desplegado mas chico que los `require` con string, porque el mensaje no queda grabado repetidas veces.
- Aplica estas tecnicas donde son gratis; reserva optimizaciones mas agresivas para el codigo verdaderamente caliente.
