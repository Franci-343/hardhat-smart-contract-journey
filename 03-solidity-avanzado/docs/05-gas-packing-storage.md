# 05 - Gas I: empaquetado de storage

Storage se organiza en slots de 32 bytes. El orden en que declaras los campos de un struct decide cuantos slots ocupa, y eso se traduce directamente en gas.

Archivos de esta leccion:

- `contracts/05-GasPackingStorage.sol`
- `test/05-GasPackingStorage.ts`
- `ignition/modules/05-GasPackingStorage.ts`
- `scripts/deploy-GasPackingStorage.ts`

## Los mismos datos, dos ordenes

```solidity
struct Desordenado {
    uint128 a;
    uint256 b;
    uint128 c;
    uint128 d;
    bool activo;
}

struct Empacado {
    uint256 b;
    uint128 a;
    uint128 c;
    uint128 d;
    bool activo;
}
```

Exactamente los mismos cinco campos, en otro orden. Contemos los slots a mano.

### `Desordenado`: 4 slots

```text
slot 0: a (16 de 32 bytes usados; quedan 16 libres)
slot 1: b (necesita el slot entero: no entra en los 16 libres de arriba)
slot 2: c (16) + d (16) = 32, entran juntos
slot 3: activo (el slot 2 ya estaba lleno)
```

### `Empacado`: 3 slots

```text
slot 0: b (usa el slot entero, no importa donde vaya)
slot 1: a (16) + c (16) = 32, entran juntos
slot 2: d (16) + activo (1) = 17, entran juntos
```

La regla: Solidity acomoda los campos **en el orden que los declaraste**, de forma "first-fit": si el campo entra en lo que queda del slot actual, va ahi; si no, abre un slot nuevo. Un `uint256` en medio de campos chicos siempre "corta" el empaquetado, porque nunca entra en un resto parcial.

## La comparacion, en gas real

```ts
const gasDesordenado = await publicClient.estimateContractGas({
  address: contrato.address, abi: contrato.abi,
  functionName: "agregarDesordenado", args: [1n, 2n, 3n, 4n, true],
});
const gasEmpacado = await publicClient.estimateContractGas({
  address: contrato.address, abi: contrato.abi,
  functionName: "agregarEmpacado", args: [1n, 2n, 3n, 4n, true],
});

assert.ok(gasEmpacado < gasDesordenado);
```

Al correr el script de esta leccion:

```text
Gas de agregarDesordenado (4 slots): 134275
Gas de agregarEmpacado (3 slots):    115085
Diferencia: 19190
```

La diferencia (~19 000 gas) es casi exactamente el costo de escribir un slot de storage nuevo desde cero (~20 000 gas). Tiene sentido: `Desordenado` escribe un slot mas que `Empacado`, para guardar exactamente la misma informacion.

## Por que esto importa mas de lo que parece

Esta diferencia es por **una sola escritura**. Si el struct se escribe miles de veces (una posicion en un juego, un balance por usuario, un registro por transaccion), la diferencia se multiplica. En protocolos con mucho volumen, reordenar un struct para ahorrar un slot es una de las optimizaciones de gas mas simples y con mejor relacion costo/beneficio que existen.

## Como pensar el orden al escribir un struct

1. Agrupa los campos por tamano: junta los `uint128`, `uint64`, `address`, `bool`, etc.
2. Pone los tipos de 32 bytes completos (`uint256`, `bytes32`) donde quieras, no afectan al resto.
3. Ordena para que los campos chicos queden **adyacentes** en la declaracion: eso es lo que les permite compartir slot.
4. Si tenes un `address` (20 bytes) y necesitas acompanarlo con algo chico, un `bool` o un `uint88` (que sobra: 20+12=32) encajan perfecto en los 12 bytes que quedan libres.

## El limite de esta tecnica

Empaquetar ahorra gas en **escrituras** (menos slots para escribir) y en algunos casos en lecturas (si necesitas varios campos chicos del mismo slot, es una sola lectura en vez de varias). Pero tiene una contra: leer o escribir solo UN campo chico de un slot compartido no es mas barato que si estuviera solo (el costo de tocar ese slot es el mismo), y el codigo generado para desempacar/empacar campos chicos agrega un poco de gas de computo (mucho menor que el ahorro de storage, pero no es cero). No es magia gratuita: es un trade-off, casi siempre a favor de empaquetar cuando el struct se escribe con frecuencia.

## Ejecutar el test

```bash
npx hardhat test test/05-GasPackingStorage.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-GasPackingStorage.ts --network hardhatMainnet
```

## Errores comunes

### Reordenar sin revisar como afecta a la herencia

La leccion 07 muestra que la herencia CONTINUA la numeracion de slots del padre: reordenar un struct hijo puede cambiar como empaqueta con lo que dejo el padre.

### Asumir que "menos campos" es lo mismo que "menos slots"

Lo que cuenta es el TAMANO y el ORDEN, no la cantidad de campos. Un struct con 2 campos (dos `uint256`) usa 2 slots igual que uno con 6 campos bien empaquetados en 2 slots.

### Optimizar structs que casi no se escriben

Si un struct se escribe una sola vez (por ejemplo, configuracion fijada en el constructor), el ahorro de reordenarlo es marginal. Prioriza los structs que se escriben muchas veces.

## Ejercicios

1. Agrega un sexto campo (`uint64`) a ambos structs, en la mejor posicion posible para no agregar un slot nuevo en `Empacado`, y confirma que sigue en 3 slots.
2. Calcula a mano cuantos slots ocuparia un struct con `bool, uint256, bool, uint256, bool` (tres bools separados por dos uint256), y confirmalo leyendo el storage crudo como en la leccion 07.
3. Mide la diferencia de gas para 10 escrituras seguidas (no solo una) y compara la proporcion.

## Resumen

- Storage se organiza en slots de 32 bytes; los campos se acomodan en el orden declarado, "first-fit".
- Un tipo de 32 bytes completo (`uint256`) siempre corta el empaquetado de los campos chicos vecinos.
- Reordenar los campos de un struct (agrupando los chicos) puede ahorrar slots completos sin cambiar ningun dato que guarda.
- El ahorro se multiplica por la cantidad de veces que ese struct se escribe: vale la pena en structs de alto volumen.
