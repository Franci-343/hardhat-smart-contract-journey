# 00 - Introduccion a Solidity avanzado

En el modulo 02 aprendiste a **construir**: herencia, interfaces, librerias, ERC-20, ERC-721. En este modulo aprendes a **romper y defender**: por que ciertos patrones que parecen correctos fallan en produccion, y como se ven los ataques reales por dentro.

Este es el modulo mas denso del camino de Solidity. Varias lecciones (proxies, `delegatecall`, `CREATE2`, manipulacion de oraculos) tocan primitivas que la mayoria de los desarrolladores nunca escribe a mano en produccion (se usa OpenZeppelin), pero que **hay que entender** para poder leer auditorias, evaluar un protocolo antes de usarlo, o depurar un bug raro.

## Como esta construido este modulo

Cada leccion de este modulo, cuando aplica, sigue el mismo patron:

1. **Version vulnerable**: un contrato con un bug real, no inventado.
2. **El ataque**: otro contrato que lo explota, con numeros concretos.
3. **Version corregida**: la misma idea, con la defensa aplicada.
4. **Un test que prueba las tres cosas**, no solo que "compila".

Cada afirmacion tecnica de este modulo (los slots de EIP-1967, el bytecode de un clon minimo EIP-1167, el separador de dominio de EIP-712) esta **verificada por un test que se ejecuta**, no solo descrita. Cuando un test compara el resultado de tu contrato contra el de una libreria independiente (por ejemplo, `getCreate2Address` de viem calculando la misma direccion que tu formula en Solidity), es la forma mas fuerte de confirmar que algo esta bien: dos implementaciones distintas, mismo resultado.

## Que vas a aprender

| Bloque | Lecciones | Idea central |
| --- | --- | --- |
| Vulnerabilidades clasicas | 01 a 04 | Reentrancy, control de acceso, aritmetica, front-running |
| Gas y storage | 05 a 08 | Empaquetado, patrones de codigo, layout de slots, assembly |
| Patrones avanzados | 09 a 12 | `delegatecall`, proxies, contratos actualizables, clones y `CREATE2` |
| Estandares avanzados | 13, 14, 16 | Firmas EIP-712, ERC-4626, ERC-1155 |
| Seguridad de sistemas completos | 15, 17 | Manipulacion de oraculos con flash loans, checklist final |

## Requisitos previos

Deberias sentirte comodo con todo el modulo 02: herencia, interfaces, `try/catch`, llamadas de bajo nivel (`call`), `storage`/`memory`/`calldata`, control de acceso por roles, y los conceptos de ERC-20/ERC-721. Varias lecciones de aca son literalmente "la version dificil" de algo que ya viste:

- La leccion 01 (reentrancy) profundiza el patron checks-effects-interactions que viste en el modulo 02, leccion 06.
- La leccion 09 (`delegatecall`) profundiza las llamadas de bajo nivel del modulo 02, leccion 10.
- La leccion 15 (manipulacion de oraculos) depende directamente de lo que aprendiste sobre validar oraculos en el modulo 02, leccion 16.

## Advertencia sobre los contratos de este modulo

Los contratos **vulnerables** de este modulo son deliberadamente inseguros. Existen solo para que los explotes en un entorno local, entiendas el mecanismo, y los compares con su version corregida. **Nunca** copies un contrato "vulnerable" de aca a un proyecto real, ni siquiera por accidente. Cada leccion deja bien marcado cual version es cual.

## Estructura del modulo

```text
03-solidity-avanzado/
  contracts/          17 archivos, uno por leccion (varios contratos por archivo)
  test/               Un test por leccion, con las tres partes (vulnerable, ataque, fix)
  ignition/modules/   Modulos de despliegue con Hardhat Ignition
  scripts/            Scripts de demostracion con viem
  docs/               Estas lecciones
```

## Como estudiar cada leccion

1. Lee la leccion en `docs/`.
2. Abre el contrato correspondiente en `contracts/` y lee los comentarios: cada uno explica el bug en el lugar exacto donde ocurre.
3. Corre el test:

   ```bash
   npx hardhat test test/01-Reentrancy.ts
   ```

4. Corre el script de demostracion para ver los numeros reales:

   ```bash
   npx hardhat run scripts/deploy-Reentrancy.ts --network hardhatMainnet
   ```

5. Modifica algo (el orden de dos lineas, un chequeo que falta) y vuelve a correr el test. Ver el ataque **dejar de funcionar** cuando aplicas la correccion es la mejor forma de entender por que la correccion importa.

## Comandos utiles

```bash
npm install
npm run compile
npm test
npx tsc --noEmit          # o: npm run typecheck
```

## Sobre las herramientas de auditoria

Este modulo no instala herramientas externas de analisis (Slither, Foundry con fuzzing, Mythril): son herramientas de linea de comandos separadas del ecosistema de Hardhat, y su instalacion depende del sistema operativo. La leccion 17 las menciona conceptualmente y explica que detecta cada una, para que sepas que buscar cuando las uses en un proyecto propio.

## Seguridad

- Los contratos vulnerables de este modulo son **material didactico**, no plantillas.
- Nunca uses ninguno de estos patrones vulnerables con fondos reales.
- Sigue sin subir `.env`, claves privadas ni seed phrases.

## Siguiente paso

Empieza con [01 - Reentrancy](01-reentrancy.md).
