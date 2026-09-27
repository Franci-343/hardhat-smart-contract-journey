# 07 - Layout de storage

En la leccion 05 contaste slots a mano para un struct. Aca vas mas al fondo: como se numeran los slots con herencia, y las formulas exactas para encontrar donde vive un elemento de un array o el valor de un mapping. Todo lo que dice esta leccion esta comprobado leyendo el storage crudo del contrato, no solo explicado.

Archivos de esta leccion:

- `contracts/07-StorageLayout.sol`
- `test/07-StorageLayout.ts`
- `ignition/modules/07-StorageLayout.ts`
- `scripts/deploy-StorageLayout.ts`

## La herencia no reinicia la numeracion

```solidity
contract Padre {
    uint256 public valorPadre; // slot 0
    address public duenoPadre; // slot 1 (20 de 32 bytes)
}

contract StorageLayout is Padre {
    bool public activo;        // comparte el slot 1 con duenoPadre
    uint256 public numero;     // slot 2
    uint256[] public numeros;  // slot 3 (el largo; los elementos, aparte)
    mapping(address => uint256) public balances; // slot 4
}
```

El hijo **continua** justo donde el padre termino. Esto tiene una consecuencia que sorprende: `activo` (declarado en el hijo) puede compartir slot con `duenoPadre` (declarado en el padre), si hay lugar. La leccion 05 ya mostro que Solidity empaqueta "first-fit"; esto muestra que ese empaquetado no respeta los limites entre contrato padre e hijo.

Confirmando con `publicClient.getStorageAt`:

```ts
const slot1 = await publicClient.getStorageAt({ address: contrato.address, slot: toHex(1) });
const direccionEnSlot1 = getAddress(`0x${slot1!.slice(-40)}`);
const boolEnSlot1 = slot1!.slice(-42, -40);

assert.equal(direccionEnSlot1, getAddress(alguien.account.address)); // duenoPadre
assert.equal(boolEnSlot1, "01"); // activo = true
```

Ambos valores viven en el MISMO slot de 32 bytes, en posiciones de byte distintas.

## Arrays dinamicos: el largo en su slot, los elementos en otro lado

Un array dinamico reserva su propio slot (llamemoslo `p`) SOLO para el **largo**. Nunca comparte ese slot con nada mas, aunque el slot anterior tuviera lugar libre.

```text
numeros.length  -> vive en el slot p (slot 3, en este contrato)
numeros[0]      -> vive en keccak256(p) + 0
numeros[1]      -> vive en keccak256(p) + 1
numeros[i]      -> vive en keccak256(p) + i
```

```ts
const largo = await publicClient.getStorageAt({ address: contrato.address, slot: toHex(3n) });
assert.equal(BigInt(largo!), 3n);

const baseElementos = BigInt(keccak256(pad(toHex(3n), { size: 32 })));

for (let i = 0; i < 3; i++) {
  const valor = await publicClient.getStorageAt({
    address: contrato.address,
    slot: toHex(baseElementos + BigInt(i)),
  });
  assert.equal(BigInt(valor!), BigInt((i + 1) * 10));
}
```

**Por que `keccak256(p)`, y no simplemente `p + 1`?** Porque si los elementos empezaran justo despues del slot `p`, dos arrays con largos parecidos podrian llegar a "pisarse" entre si si el layout no fuera cuidadoso. Usar el hash del slot como base practicamente garantiza que la zona de memoria de cada array no colisiona con la de ningun otro dato del contrato (los hashes se distribuyen por todo el espacio de 2^256 slots posibles).

## Mappings: el slot no guarda nada, solo se usa para hashear

```text
balances (slot p = 4)  -> el slot en si mismo esta SIEMPRE en cero
balances[k]             -> vive en keccak256(k_paddeado_a_32_bytes ++ p_paddeado_a_32_bytes)
```

```ts
const contenidoDelSlot = await publicClient.getStorageAt({ address: contrato.address, slot: toHex(4n) });
assert.equal(BigInt(contenidoDelSlot!), 0n); // el slot 4 nunca guarda nada directamente

const claveHasheada = concat([pad(alguien.account.address, { size: 32 }), pad(toHex(4n), { size: 32 })]);
const slotDelValor = keccak256(claveHasheada);

const valorCrudo = await publicClient.getStorageAt({ address: contrato.address, slot: slotDelValor });
assert.equal(BigInt(valorCrudo!), 999n);
```

Esta es la razon por la que un mapping "no tiene largo" ni se puede recorrer: no existe ninguna lista de claves en storage. Solo existe una formula que, dada una clave, calcula donde ESTARIA su valor. Si nunca escribiste ahi, ese slot simplemente esta en cero (que es indistinguible de "la clave no existe" - por eso, para saber si una clave "existe" de verdad, muchos contratos usan un mapping auxiliar `existe[clave] => bool`).

## Por que te tiene que importar esto

No es solo curiosidad academica:

- **Proxies y contratos actualizables** (lecciones 10 y 11) dependen enteramente de que el layout de storage coincida entre versiones. Sin entender la numeracion de slots, es imposible razonar sobre si una actualizacion es segura.
- **Auditar `delegatecall`** (leccion 09) exige poder predecir en que slot va a escribir el codigo ajeno.
- **Herramientas de depuracion** (como leer storage directo desde Etherscan o desde un script) necesitan estas formulas para ubicar un valor especifico.

## Ejecutar el test

```bash
npx hardhat test test/07-StorageLayout.ts
```

## Desplegar

```bash
npx hardhat run scripts/deploy-StorageLayout.ts --network hardhatMainnet
```

## Errores comunes

### Asumir que agregar una variable al padre no afecta al hijo

Si un contrato padre agrega una variable nueva en el MEDIO de sus declaraciones (no al final), corre todo lo que venia despues, incluidas TODAS las variables del hijo. Esto es exactamente el bug que vas a ver en la leccion 11 con contratos actualizables.

### Intentar "recorrer" un mapping

No se puede, porque no hay ninguna lista de claves en storage: solo la formula de hasheo. Si necesitas iterar, hace falta mantener un array auxiliar con las claves usadas.

### Confundir "el mapping esta vacio" con "el mapping tiene esa clave en cero"

Storage arranca todo en cero. Sin un flag auxiliar, no hay forma de distinguir "nunca se escribio esta clave" de "se escribio explicitamente el valor cero".

## Ejercicios

1. Agrega un segundo array dinamico despues de `balances` y calcula a mano en que slot deberia quedar su largo.
2. Escribe una funcion que lea el storage de un `mapping(address => mapping(address => uint256))` (un mapping anidado, como el `allowance` de ERC-20) usando la formula de hasheo dos veces.
3. Demuestra, leyendo storage crudo, que un `struct` dentro de un array (`MiStruct[] public arr`) tambien empieza en `keccak256(slot)`, y que sus campos se acomodan despues siguiendo las mismas reglas de empaquetado de la leccion 05.

## Resumen

- La herencia continua la numeracion de slots del padre; el hijo puede compartir el ultimo slot parcialmente usado del padre.
- Un array dinamico guarda su largo en su slot declarado; sus elementos viven en `keccak256(slot) + i`.
- Un mapping no guarda nada en su propio slot; el valor de una clave vive en `keccak256(clave ++ slot)`.
- Estas formulas son la base para entender proxies, `delegatecall`, y cualquier herramienta que lea storage directamente.
