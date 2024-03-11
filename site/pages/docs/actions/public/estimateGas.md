# estimateGas [An Action for estimating gas for a transaction.]

Estimates the gas necessary to complete a transaction without submitting it to the network.

## Usage

:::code-group

```ts twoslash [example.ts]
import { account, publicClient } from './config'

const gas = await publicClient.estimateGas({ // [!code focus:7]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// @log: ↓ JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

// @log: ↓ Local Account
// export const account = privateKeyToAccount('0x...')

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

`bigint`

The gas estimate (in wei).

## Parameters

### account

- **Type:** `Account | Address`

The Account to estimate gas from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const gas = await publicClient.estimateGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### data (optional)

- **Type:** `0x${string}`

Contract code or a hashed method call with encoded args.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const gas = await publicClient.estimateGas({
  data: '0x...', // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther, parseGwei } from 'viem'

const gas = await publicClient.estimateGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther, parseGwei } from 'viem'

const gas = await publicClient.estimateGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther, parseGwei } from 'viem'

const gas = await publicClient.estimateGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### to (optional)

- **Type:** [`Address`](/docs/glossary/types#address)

Transaction recipient.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const gas = await publicClient.estimateGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
  value: parseEther('1')
})
```

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const gas = await publicClient.estimateGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the gas estimate against.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const gas = await publicClient.estimateGas({
  blockNumber: 15121123n, // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the gas estimate against.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const gas = await publicClient.estimateGas({
  blockTag: 'safe', // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

## JSON-RPC Methods

[`eth_estimateGas`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas)
