# 11 - Verificar contrato en Etherscan

Verificar un contrato significa demostrarle a Etherscan que cierto codigo Solidity produce el bytecode desplegado en una direccion.

Cuando verificas, otras personas pueden leer el codigo fuente del contrato directamente en el explorador.

## Por que verificar

Verificar ayuda a:

- Dar transparencia.
- Permitir lectura del codigo fuente.
- Usar `Read Contract` y `Write Contract` comodamente.
- Compartir contratos con otros desarrolladores.
- Facilitar auditorias y aprendizaje.

En proyectos reales, un contrato no verificado genera menos confianza.

## Que necesitas

Para verificar normalmente necesitas:

- Direccion del contrato desplegado.
- Red correcta, por ejemplo Sepolia.
- Codigo fuente exacto.
- Misma version de compilador.
- Misma configuracion de optimizer.
- Argumentos del constructor, si existen.
- API key de Etherscan, si la herramienta la requiere.

## Codigo exacto

La verificacion compara bytecode. Si cambias el contrato despues de desplegarlo, ese nuevo codigo ya no coincide con el contrato viejo.

Por eso conviene:

1. Compilar.
2. Testear.
3. Desplegar.
4. Guardar direccion y commit.
5. Verificar sin modificar el codigo.

## Version del compilador

Este proyecto usa Solidity `0.8.34` en `hardhat.config.ts`.

Si desplegaste con una version y verificas con otra, puede fallar.

## Optimizer

La configuracion de produccion del proyecto activa optimizer:

```ts
optimizer: {
  enabled: true,
  runs: 200,
}
```

Si desplegaste con optimizer activado, debes verificar con la misma configuracion. Si desplegaste sin optimizer, tambien debe coincidir.

## Constructor arguments

Si el contrato tiene constructor:

```solidity
constructor(string memory initialMessage) {
    message = initialMessage;
}
```

Debes verificar usando exactamente el mismo argumento que usaste al desplegar.

Si el contrato no tiene constructor o no recibe parametros, este paso es mas simple.

## Verificacion con herramientas

El comando exacto depende de los plugins instalados y de la version de Hardhat.

El flujo conceptual es:

```bash
npx hardhat verify --network sepolia DIRECCION_DEL_CONTRATO
```

Si hay argumentos de constructor:

```bash
npx hardhat verify --network sepolia DIRECCION_DEL_CONTRATO "Hola, Solidity"
```

Si el comando no existe, revisa si falta instalar o configurar el plugin de verificacion compatible con tu version de Hardhat.

## Verificacion manual

Tambien puedes verificar desde Etherscan:

1. Abre la direccion del contrato.
2. Entra a la pestana `Contract`.
3. Selecciona `Verify and Publish`.
4. Elige compilador y licencia.
5. Pega el codigo fuente.
6. Configura optimizer igual que en el despliegue.
7. Agrega constructor arguments si aplica.
8. Envia la verificacion.

## Errores comunes

### Compiler version mismatch

La version del compilador no coincide.

### Bytecode does not match

El codigo, optimizer o constructor arguments no son los mismos.

### Contract already verified

No es un problema. Significa que la direccion ya fue verificada.

### Invalid address

La direccion no existe en esa red o la copiaste mal.

## Checklist final

- Estoy en Sepolia Etherscan.
- La direccion es la correcta.
- El codigo fuente no cambio despues del despliegue.
- La version de Solidity coincide.
- El optimizer coincide.
- Los argumentos del constructor coinciden.
- La API key, si se usa, esta configurada fuera del repo.

Verificar es una buena costumbre: hace que tu aprendizaje y tus despliegues sean mas transparentes.
