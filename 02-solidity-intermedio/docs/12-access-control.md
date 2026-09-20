# 12 - Control de acceso por roles

Un contrato publico puede ser llamado por **cualquiera**. Casi todo contrato real necesita decidir quien puede hacer que: acunar tokens, pausar, cambiar parametros, retirar fondos.

Archivos de esta leccion:

- `contracts/12-AccessControl.sol`
- `test/12-AccessControl.ts`
- `ignition/modules/12-AccessControl.ts`
- `scripts/deploy-AccessControl.ts`

## De un dueno a varios roles

La solucion mas simple es un unico `owner` (leccion 13). Funciona, pero tiene limites:

- Una sola cuenta tiene **todos** los poderes. Si se compromete, se pierde todo.
- No puedes dar a alguien un permiso pequeno sin darle todos.

El **control de acceso por roles** (RBAC) separa los permisos:

| Rol | Puede |
| --- | --- |
| `ADMIN_ROLE` | Dar y quitar roles |
| `MINTER_ROLE` | Emitir tokens |
| `EDITOR_ROLE` | Cambiar el mensaje |

Cada cuenta tiene los roles que necesita, y solo esos: el **principio de minimo privilegio**.

## Como se representa un rol

Un rol es solo un identificador de 32 bytes: el hash del nombre.

```solidity
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
```

Es `constant`, asi que no ocupa storage (leccion 07). Y los permisos se guardan en un mapping doble:

```solidity
// rol => cuenta => tiene el rol?
mapping(bytes32 => mapping(address => bool)) private _roles;
```

## Proteger funciones con un modifier

```solidity
modifier soloRol(bytes32 rol) {
    if (!_roles[rol][msg.sender]) revert SinRol(rol, msg.sender);
    _;
}

function emitir(uint256 cantidad) external soloRol(MINTER_ROLE) {
    totalEmitido += cantidad;
}
```

El error personalizado incluye **que rol faltaba y quien lo intento**, lo que facilita mucho el diagnostico. El test lo verifica con `revertWithCustomErrorWithArgs`.

## Gestion de roles

```solidity
function otorgarRol(bytes32 rol, address cuenta) external soloRol(ADMIN_ROLE) { ... }
function revocarRol(bytes32 rol, address cuenta) external soloRol(ADMIN_ROLE) { ... }
function renunciarRol(bytes32 rol) external { ... }
```

- Solo un `ADMIN_ROLE` reparte o quita roles.
- **`renunciarRol`** permite que cualquier cuenta abandone su propio rol sin pedir permiso. Es importante: si una cuenta se compromete o un empleado se va, puede renunciar aunque el admin no este disponible.
- Quien despliega recibe `ADMIN_ROLE` en el constructor.

Cada cambio emite un evento (`RolOtorgado`, `RolRevocado`) con `indexed`, para que las aplicaciones y los auditores puedan seguir quien tuvo cada permiso y cuando. Los eventos son el "historial de auditoria" del contrato.

```ts
await viem.assertions.emitWithArgs(
  contrato.write.otorgarRol([MINTER, alice.account.address]),
  contrato,
  "RolOtorgado",
  [MINTER, alice.account.address, admin.account.address],
);
```

## Los roles son independientes

Un `MINTER_ROLE` **no** puede editar el mensaje aunque tenga un rol. El test lo comprueba: Alice con `MINTER_ROLE` no puede llamar a `cambiarMensaje` hasta que se le otorga `EDITOR_ROLE`.

## Que diferencia hay con la version de OpenZeppelin

`AccessControl` de OpenZeppelin funciona igual, con tres diferencias importantes:

1. **Cada rol tiene un rol administrador** propio: puedes decir "el `MINTER_ROLE` lo administra `MINTER_ADMIN_ROLE`". Aqui un unico `ADMIN_ROLE` administra todos.
2. Usa `DEFAULT_ADMIN_ROLE` (valor `0x00`) como admin por defecto.
3. Sus funciones se llaman `hasRole`, `grantRole`, `revokeRole`, `renounceRole`.

Ademas existen variantes: `AccessControlEnumerable` (permite listar los miembros de un rol) y `AccessControlDefaultAdminRules` (protege al admin con retardos y transferencia en dos pasos).

## Riesgos y buenas practicas

- **No pierdas el admin.** Si el unico admin renuncia o pierde su clave, nadie podra repartir roles nunca mas. En produccion, el admin suele ser una **multisig** (por ejemplo, Safe) y no una cuenta personal.
- **Cuidado con quien recibe roles.** Dar `MINTER_ROLE` a un contrato con bugs es dar acceso al atacante.
- **Revisa siempre los eventos** de roles al auditar quien tiene poder.
- **Documenta cada rol**: que funciones protege y quien deberia tenerlo.
- Un rol demasiado amplio anula el objetivo. Separa por funcion, no por persona.

## Ejecutar el test

```bash
npx hardhat test test/12-AccessControl.ts
```

Como probar una llamada desde otra cuenta con viem:

```ts
await contrato.write.emitir([100n], { account: alice.account });
```

## Desplegar

```bash
npx hardhat run scripts/deploy-AccessControl.ts --network hardhatMainnet
```

## Errores comunes

### Olvidar el modifier en una funcion sensible

Es el error de seguridad mas frecuente. Revisa cada funcion `external`/`public` que cambie estado y pregunta: "quien deberia poder llamarla?".

### Guardar el nombre del rol en lugar del hash

Los roles son `bytes32`. Para obtener el valor desde TypeScript, lee la constante del contrato: `await contrato.read.MINTER_ROLE()`.

### Dar `ADMIN_ROLE` a demasiadas cuentas

Cada admin puede darse cualquier otro rol.

## Ejercicios

1. Agrega un `PAUSER_ROLE` y una funcion protegida por el.
2. Agrega una funcion `cantidadDeAdmins()` que lleve la cuenta de admins y evita que el ultimo admin renuncie.
3. Implementa que `MINTER_ROLE` solo lo pueda repartir un `MINTER_ADMIN_ROLE` (como hace OpenZeppelin).

## Resumen

- RBAC separa permisos en roles y aplica minimo privilegio.
- Un rol es un `bytes32` (hash de su nombre); los permisos viven en un `mapping` doble.
- Solo un admin otorga o revoca; cualquiera puede renunciar a su propio rol.
- Emite eventos por cada cambio: son la traza de auditoria.
- En produccion, protege el admin con una multisig.
