---
description: Fills a transaction request with the fields required for signing via eth_fillTransaction.
---

# fillTransaction

Fills a transaction request with the missing fields required for signing, returning both the serialized transaction payload and a formatted transaction object.

:::info
`fillTransaction` requires node support for `eth_fillTransaction`, so it may not be available on all RPC providers or nodes.
:::

Use `fillTransaction` when you want the node to populate transaction fields via `eth_fillTransaction`. Use [`prepareTransactionRequest`](/docs/actions/wallet/prepareTransactionRequest) when you want viem to prepare the request client-side before signing.

## Usage

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { account, publicClient } from './client'

const { raw, transaction } = await publicClient.fillTransaction({ // [!code focus:6]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'),
})
// @log: {
// @log:   raw: '0x02f8...',
// @log:   transaction: {
// @log:     from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
// @log:     gas: 21000n,
// @log:     maxFeePerGas: 2000000000n,
// @log:     maxPriorityFeePerGas: 1000000000n,
// @log:     nonce: 69,
// @log:     type: 'eip1559',
// @log:     value: 1000000000000000000n,
// @log:   },
// @log: }
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::

## Returns

An object with the following properties:

- `raw`: [`Hex`](/docs/glossary/types#hex)

  The serialized transaction payload returned by the node.

- `transaction`: [`Transaction`](/docs/glossary/types#transaction)

  The formatted filled transaction.

## Parameters

### account

- **Type:** `Account | Address`

The Account to fill the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'),
})
```

### to

- **Type:** [`Address`](/docs/glossary/types#address)

The transaction recipient.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
  value: parseEther('1'),
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** [`client.chain`](/docs/clients/public#chain-optional)

Optional Chain override. Used to infer chain-specific request types and fee multiplier behavior for the filled transaction.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { optimism } from 'viem/chains' // [!code focus]

const { transaction } = await publicClient.fillTransaction({
  chain: optimism, // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### data (optional)

- **Type:** `0x${string}`

Contract code or a hashed method call with encoded arguments.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeef', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'), // [!code focus]
})
```

### gas (optional)

- **Type:** `bigint`

Gas provided for the transaction. If provided, this value is preferred over the gas value returned by the node.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  gas: 21000n, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas for a [Legacy Transaction](/docs/glossary/terms#legacy-transaction). If provided, this value is preferred over the gas price returned by the node.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseGwei } from 'viem'

const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  type: 'legacy',
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`, for an [EIP-1559 Transaction](/docs/glossary/terms#eip-1559-transaction). If provided, this value is preferred over the fee returned by the node.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseGwei } from 'viem'

const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei) for an [EIP-1559 Transaction](/docs/glossary/terms#eip-1559-transaction). If provided, this value is preferred over the fee returned by the node.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseGwei } from 'viem'

const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### nonce (optional)

- **Type:** `number`

Nonce to use for the transaction. If provided, this value is preferred over the nonce returned by the node.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  nonce: 69, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### nonceManager (optional)

- **Type:** `NonceManager | undefined`

Nonce Manager to consume and increment the Account nonce before filling the transaction request.

```ts twoslash
// @noErrors
import { createPublicClient, http, nonceManager, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const account = privateKeyToAccount('0x...')

const { transaction } = await publicClient.fillTransaction({
  account,
  nonceManager, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'),
})
```

### type (optional)

- **Type:** `"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702"`

The transaction type to fill.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const { transaction } = await publicClient.fillTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  type: 'legacy', // [!code focus]
})
```

## JSON-RPC Method

`eth_fillTransaction`
