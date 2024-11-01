---
description: Estimates the L1 + L2 fee to execute an L2 transaction.
---

# estimateTotalFee

Estimates the [L1 data fee](https://docs.optimism.io/stack/transactions/fees#l1-data-fee) + L2 fee to execute an L2 transaction.

It is the sum of [`estimateL1Fee`](/op-stack/actions/estimateL1Fee) (L1 Gas) and [`estimateGas`](/docs/actions/public/estimateGas.md) * [`getGasPrice`](/docs/actions/public/getGasPrice.md) (L2 Gas * L2 Gas Price).

## Usage

:::code-group

```ts [example.ts]
import { account, publicClient } from './config'

const fee = await publicClient.estimateTotalFee({ // [!code focus:7]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { publicActionsL2 } from 'viem/op-stack'

// JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const publicClient = createPublicClient({
  chain: base,
  transport: http()
}).extend(publicActionsL2())
```

:::

## Returns

`bigint`

The L1 fee (in wei).

## Parameters

### account

- **Type:** `Account | Address`

The Account to estimate fee from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const fee = await publicClient.estimateTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### data (optional)

- **Type:** `0x${string}`

Contract code or a hashed method call with encoded args.

```ts
const fee = await publicClient.estimateTotalFee({
  data: '0x...', // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### gasPriceOracleAddress (optional)

- **Type:** [`Address`](/docs/glossary/types#address)

Address of the Gas Price Oracle predeploy contract.

```ts
const fee = await publicClient.estimateTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  gasPriceOracleAddress: '0x420000000000000000000000000000000000000F', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. 

```ts
const fee = await publicClient.estimateTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). 

```ts
const fee = await publicClient.estimateTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const fee = await publicClient.estimateTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'),
  nonce: 69, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### to (optional)

- **Type:** [`Address`](/docs/glossary/types#address)

Transaction recipient.

```ts
const fee = await publicClient.estimateTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
  value: parseEther('1')
})
```

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts
const fee = await publicClient.estimateTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') // [!code focus]
})
```
