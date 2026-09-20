# 14 - ERC-20 basico

ERC-20 es el estandar de **tokens fungibles** de Ethereum. Casi todas las monedas y tokens que conoces (USDC, DAI, UNI, LINK) lo cumplen. Si un token sigue el estandar, cualquier wallet, exchange o contrato sabe como usarlo sin conocer su codigo.

Archivos de esta leccion:

- `contracts/14-ERC20Basico.sol`
- `test/14-ERC20Basico.ts`
- `ignition/modules/14-ERC20Basico.ts`
- `scripts/deploy-ERC20Basico.ts`

Antes de seguir, repasa [00-fundamentos-blockchain/tokens.md](../../00-fundamentos-blockchain/tokens.md).

## Que significa "fungible"

Cada unidad es **intercambiable** con otra. 1 TCU vale igual que cualquier otro 1 TCU, igual que un billete de 10 dolares vale lo mismo que otro. Un token ERC-20 es, por dentro, solo un contrato con un `mapping` de saldos:

```solidity
mapping(address => uint256) private _balances;
```

"Tener 100 tokens" significa que ese mapping guarda `100` para tu direccion. Los tokens no estan "en tu wallet": estan **registrados en el contrato**.

## La interfaz del estandar

```solidity
interface IERC20Basico {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}
```

Y opcionalmente `name()`, `symbol()` y `decimals()` (extension de metadata), que nuestro contrato tambien incluye.

## Decimales

Solidity no tiene numeros decimales. Un token con `decimals = 18` guarda las cantidades en su unidad minima:

```text
1 token  = 1_000_000_000_000_000_000 unidades  (1e18)
0.5 token = 500_000_000_000_000_000
```

Igual que 1 ETH = 1e18 wei. Por convencion casi todos usan 18 decimales (excepto algunos como USDC, con 6).

En el contrato, `suministroInicial` se pasa en **tokens enteros** y se convierte:

```solidity
_mint(msg.sender, suministroInicial * 10 ** decimals);
```

Desde TypeScript, viem ayuda con la conversion:

```ts
import { parseEther, formatEther } from "viem";

parseEther("1000");        // 1000000000000000000000n
formatEther(1500000000000000000n);   // "1.5"
```

`parseEther` funciona para cualquier token de 18 decimales. Con otros decimales usa `parseUnits(valor, decimales)`.

## Transferir

```solidity
function transfer(address to, uint256 value) external returns (bool) {
    _transfer(msg.sender, to, value);
    return true;
}

function _transfer(address from, address to, uint256 value) internal {
    if (to == address(0)) revert DireccionInvalida(to);

    uint256 saldo = _balances[from];
    if (saldo < value) revert SaldoInsuficiente(from, saldo, value);

    _balances[from] = saldo - value;
    _balances[to] += value;

    emit Transfer(from, to, value);
}
```

Detalles:

- Transferir a `address(0)` se rechaza: se perderian los tokens. Para destruirlos existe `burn`.
- Se lee el saldo **una vez** y se compara: menos lecturas de storage.
- Siempre se emite `Transfer`. Wallets y exploradores dependen de este evento para mostrar el historial.

## Allowance: dar permiso a un tercero

Un contrato (por ejemplo, un exchange) no puede sacar tokens de tu cuenta por su cuenta. Primero debes **aprobarlo**:

```text
1. Tu:      token.approve(exchange, 300)
2. Exchange: token.transferFrom(tu, otro, 200)   // usa parte del permiso
```

```solidity
mapping(address => mapping(address => uint256)) private _allowances;
// _allowances[dueno][gastador] = cantidad permitida
```

`transferFrom` descuenta el permiso usado. En el test, tras aprobar `300` y gastar `200`, quedan `100`.

Este flujo de dos pasos (approve + transferFrom) es como funcionan Uniswap, los prestamos, los mercados de NFTs y casi cualquier interaccion de DeFi.

### Allowance infinito

```solidity
if (permitido != type(uint256).max) {
    _allowances[from][msg.sender] = permitido - value;
}
```

Muchas dapps piden aprobar `type(uint256).max` para que no tengas que aprobar en cada operacion. El contrato lo respeta y no descuenta.

**Cuidado como usuario**: un permiso infinito a un contrato con bugs o malicioso permite vaciar tu saldo de ese token. Revisa y revoca permisos que ya no usas (por ejemplo, con la herramienta de Etherscan "Token Approval Checker").

### Riesgo conocido de `approve`

Si cambias un permiso de `100` a `50`, el gastador puede ver la transaccion pendiente y gastar los `100` viejos **antes** de que se procese tu cambio, y luego gastar los `50` nuevos. La mitigacion habitual es pasar el permiso primero a `0`, o usar `increaseAllowance`/`decreaseAllowance`. No lo implementamos aqui por brevedad; la version de OpenZeppelin actual tampoco lo incluye.

## Crear y destruir tokens

```solidity
function mint(address to, uint256 value) external soloOwner { _mint(to, value); }

function burn(uint256 value) external { ... }
```

- `mint`: solo el `owner` puede crear tokens nuevos. **Es un poder enorme**: un owner malicioso puede inflar el suministro. Por eso muchos tokens no tienen `mint`, o lo restringen con roles y limites.
- `burn`: cualquiera puede destruir los suyos. Reduce `totalSupply`.
- Ambos emiten `Transfer`, desde/hacia `address(0)` (la convencion para mint/burn).

## Errores personalizados

```solidity
error SaldoInsuficiente(address cuenta, uint256 saldo, uint256 necesario);
error AllowanceInsuficiente(address spender, uint256 permitido, uint256 necesario);
```

Cuentan mas que un simple `"insufficient balance"`: dicen **cuanto tenia y cuanto se necesitaba**. OpenZeppelin v5 usa el mismo enfoque.

## Este contrato vs OpenZeppelin

En proyectos reales:

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MiToken is ERC20 {
    constructor() ERC20("Mi Token", "MTK") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}
```

Con muchas menos lineas y auditado. Aprender la version manual sirve para entender que hace `ERC20` por dentro y detectar tokens con comportamientos raros.

Tokens "no estandar" que conviene conocer: USDT no devuelve `bool` en `transfer`, algunos tokens cobran comision en cada transferencia y otros se pueden pausar o bloquear cuentas. Los contratos que interactuan con tokens desconocidos suelen usar `SafeERC20` de OpenZeppelin para manejar estas diferencias.

## Ejecutar el test

```bash
npx hardhat test test/14-ERC20Basico.ts
```

El test usa un **fixture**: `networkHelpers.loadFixture(desplegarToken)`. Despliega una vez, guarda una foto del estado de la red y la restaura en cada test: es mucho mas rapido que desplegar de nuevo cada vez.

## Desplegar

```bash
npx hardhat run scripts/deploy-ERC20Basico.ts --network hardhatMainnet
```

Con Ignition, los parametros vienen de `m.getParameter`:

```bash
npx hardhat ignition deploy ignition/modules/14-ERC20Basico.ts --network hardhatMainnet
```

Una vez en Sepolia, puedes agregar el token a MetaMask con **Importar tokens** pegando la direccion del contrato: veras tu saldo con el simbolo `TCU`.

## Errores comunes

### Confundir tokens enteros con unidades minimas

Transferir `1` no es transferir un token: es `1e-18` de token. Usa `parseEther("1")`.

### Olvidar el `approve` antes de un `transferFrom`

El gastador recibira `AllowanceInsuficiente`.

### Mintear sin control de acceso

Un `mint` publico permite a cualquiera crear tokens infinitos.

### Suponer que `transfer` siempre devuelve `true` en cualquier token

Algunos tokens reales no devuelven nada.

## Ejercicios

1. Agrega `increaseAllowance` y `decreaseAllowance`.
2. Agrega un `cap`: un maximo de tokens que `mint` nunca pueda superar.
3. Crea un contrato `Faucet` que entregue 10 tokens a quien lo pida, una vez por dia (usa la leccion 06).
4. Reemplaza el `owner` por los roles de la leccion 12.

## Resumen

- ERC-20 es un contrato con un mapping de saldos y un conjunto de funciones y eventos estandar.
- Las cantidades usan la unidad minima (`decimals`, normalmente 18).
- `approve` + `transferFrom` permiten que otros contratos muevan tus tokens con permiso.
- `mint` y `burn` deben controlarse con cuidado; un permiso infinito es un riesgo para el usuario.
- En produccion, usa OpenZeppelin.
