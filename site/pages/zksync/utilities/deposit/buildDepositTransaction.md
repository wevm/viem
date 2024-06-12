---
outline: deep
description: Builds & prepares parameters for a deposit transaction to be initiated on an L1 and executed on the L2.
---

# buildDepositTransaction

Transfers the specified token from the associated account on the L1 network to the target account on the L2 network.
The token can be either ETH or any ERC20 token. For ERC20 tokens, enough approved tokens must be associated with the specified L1 bridge (default one or the one defined in `transaction.bridgeAddress`).
In this case, depending on is the chain ETH-based or not `transaction.approveERC20` or `transaction.approveBaseERC20` can be enabled to perform token approval. If there are already enough approved tokens for the L1 bridge, token approval will be skipped.

## Usage

:::code-group

```ts [example.ts]
import { deposit } from './buildDepositTransaction.js'
import { clientL1, clientL2, account } from './config.ts'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  refundRecipient: account.address,
})
const hash = await sendTransaction(clientL1, depositArgs)
```

```ts [config.ts]
import { createClient, createWalletClient, http } from 'viem'
import { zkSyncChainL1, zkSyncChainL2 } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const account = privateKeyToAccount('0x...')

export const clientL1 = createClient({
  chain: zkSyncChainL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

export const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
  account,
}).extend(publicActionsL2())
```

:::

## Returns

`DepositReturnType`

The parameters required to execute a deposit transaction.

## Parameters

### amount

- **Type:** `bigint`

The amount of the token to deposit.


```ts
const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n, // [!code focus]
})
```

### to

- **Type:** `Address`

The address that will receive the deposited tokens on L2.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  to:"0x..." // [!code focus]
})
```

### token (optional)

- **Type:** `Address`

The address of the token to deposit. ETH by default.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  token:"0x..." // [!code focus]
})
```

### operatorTip (optional)

- **Type:** `bigint`

(currently not used) If the ETH value passed with the transaction is not explicitly stated in the overrides, this field will be equal to the tip the operator will receive on top of the base cost of the transaction.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  operatorTip:100n // [!code focus]
})
```

### bridgeAddress (optional)

- **Type:** `Address`

The address of the bridge contract to be used.
Defaults to the default zkSync Era bridge (either `L1EthBridge` or `L1Erc20Bridge`).

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  bridgeAddress:"0x..." // [!code focus]
})
```

### approveERC20 (optional)

- **Type:** `boolean`

Whether or not token approval should be performed under the hood.
Set this flag to true if you bridge an ERC20 token and didn't call the {@link approveERC20} function beforehand.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  approveERC20:true // [!code focus]
})
```

### approveBaseERC20 (optional)

- **Type:** `boolean`

Whether or not base token approval should be performed under the hood.
Set this flag to true if you bridge a base token and didn't call the {@link approveERC20} function beforehand.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  approveBaseERC20:true // [!code focus]
})
```

### l2GasLimit (optional)

- **Type:** `bigint`

Maximum amount of L2 gas that the transaction can consume during execution on L2.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  l2GasLimit:100200300n // [!code focus]
})
```

### gasPerPubdataByte (optional)

- **Type:** `bigint`

The L2 gas price for each published L1 calldata byte.


```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  gasPerPubdataByte:800n // [!code focus]
})
```

### refundRecipient (optional)

- **Type:** `Address`

The address on L2 that will receive the refund for the transaction.
If the transaction fails, it will also be the address to receive `l2Value`.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  refundRecipient:"0x..." // [!code focus]
})
```

### overrides (optional)

- **Type:** `Overrides`

Transaction's overrides for deposit which may be used to pass
L1 `gasLimit`, `gasPrice`, `value`, etc.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  overrides:{...} // [!code focus]
})
```

### approveOverrides (optional)

- **Type:** `Overrides`

Transaction's overrides for approval of an ERC20 token which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  approveOverrides:{...} // [!code focus]
})
```

### approveBaseOverrides (optional)

- **Type:** `Overrides`

Transaction's overrides for approval of a base token which may be used to pass L1 `gasLimit`, `gasPrice`, `value`, etc.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  approveBaseOverrides:{...} // [!code focus]
})
```

### customBridgeData (optional)

- **Type:** `Hex`

Additional data that can be sent to a bridge.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  customBridgeData:"0x..." // [!code focus]
})
```