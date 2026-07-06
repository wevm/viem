---
description: Returns an estimated gas for L1 to L2 execution.
---

# estimateGasL1ToL2

Returns an estimated gas for L1 to L2 execution

## Usage

:::code-group
```ts [example.ts]
import { client } from './config'

const gas = await client.estimateGasL1ToL2({
  account: '0x636A122e48079f750d44d13E5b39804227E1467e',
  to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
  value: 0n
});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zksync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zksync,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`bigint`

The estimated gas value.

## Parameters

### account

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### to

- **Type:** `0x${string}`

The transaction recipient or contract address.

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
  value: 1000000000000000000n,
  nonce: 69
})
```

### data (optional)

- **Type:** `0x${string}`

A contract hashed method call with encoded args.

```ts
const gas = await walletClient.estimateGasL1ToL2({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // [!code focus]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account,
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n,
  nonce: 69 // [!code focus]
})
```

### value (optional)

- **Type:** `bigint`

Value in wei sent with this transaction.

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'), // [!code focus]
  nonce: 69
})
```

### gasPerPubdata (optional)

- **Type:** `bigint`

The amount of gas for publishing one byte of data on Ethereum.

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  gasPerPubdata: 50000, // [!code focus]
  nonce: 69,
  value: 1000000000000000000n
})
```

### factoryDeps (optional)

- **Type:** `[0x${string}]`

Contains bytecode of the deployed contract.

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  factoryDeps: ['0xcde...'], // [!code focus]
  nonce: 69,
  value: 1000000000000000000n
})
```

### paymaster (optional)

- **Type:** `Account | Address`

Address of the paymaster account that will pay the gas. The `paymasterInput` field is required with this one.

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
  nonce: 69,
  value: 1000000000000000000n
})
```

### paymasterInput (optional)

- **Type:** `0x${string}`

Input data to the paymaster. The `paymaster` field is required with this one.

```ts
const gas = await walletClient.estimateGasL1ToL2({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
  nonce: 69,
  value: 1000000000000000000n
})
```
