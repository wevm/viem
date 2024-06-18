---
outline: deep
description: Builds & prepares parameters for a withdraw transaction to be initiated on L2.
---

# initiateWithdraw

Initiates a withdrawal on a L2 to the L1.

## Usage

:::code-group

```ts [example.ts]
import { clientL1, clientL2, account } from './config.ts'
import { initiateWithdrawal } from 'viem/zksync'

// Initiate the withdrawal transaction.
const hash = await initiateWithdrawal(clientL1, clientL2,{
  token: "0x0000000000000000000000000000000000000000",
  amount: 1n,
  to: account.address,
})
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

`InitiateWithdrawalReturnType`

it incldues a Hash of the withdrawal transaction.

## Parameters

- **Type:** `InitiateWithdrawalParameters`

Object which contains necessary data for constructing withdraw transaction.

### amount

- **Type:** `bigint`

The amount of the token to withdraw.


```ts
const depositArgs = await initiateWithdrawal(clientL1, clientL2, {
  amount:1n, // [!code focus]
})
```

### token 

- **Type:** `Address`

The address of the token to deposit. ETH by default.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await initiateWithdrawal(clientL1, clientL2, {
  amount:1n,
  token:"0x..." // [!code focus]
})
```

### to

- **Type:** `Address`

The address that will receive the tokens on L1.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  to:"0x..." // [!code focus]
})
```

### bridgeAddress

- **Type:** `Address`

The address of the bridge contract to be used.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  to:"0x...",
  bridgeAddress:"0x..." // [!code focus]
})

```

### paymasterParams

- **Type:** `PaymasterParams`

 Paymaster parameters.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  to:"0x...",
  bridgeAddress:"0x...",
  paymasterParams: {...} // [!code focus]
})

```

### overrides

- **Type:** `Overrides`

Transaction's overrides which may be used to pass L2 `gasLimit`, `gasPrice`, `value`, etc.

```ts
import { deposit } from './buildDepositTransaction.js'

const depositArgs = await deposit(clientL1, clientL2, {
  amount:1n,
  to:"0x...",
  bridgeAddress:"0x...",
  paymasterParams: {...},
  overrides: {...} // [!code focus]
})

```
