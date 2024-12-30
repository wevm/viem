# createAccessList

Creates an [EIP-2930](https://eips.ethereum.org/EIPS/eip-2930) access list based on a transaction request.

## Usage

:::code-group

```ts twoslash [example.ts]
import { account, publicClient } from './config'

const result = await publicClient.createAccessList({ // [!code focus:7]
  data: '0xdeadbeef',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

`{ accessList: AccessList, gasUsed: bigint }`

The access list and gas used.

## Parameters

### account (optional)

- **Type:** `Account | Address`

The Account to create an access list for.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const result = await publicClient.createAccessList({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  data: '0xdeadbeef',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### blockNumber (optional)

- **Type:** `number`

Block number to create an access list for.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const result = await publicClient.createAccessList({
  blockNumber: 15121123n, // [!code focus]
  data: '0xdeadbeef',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Block tag to create an access list for.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const result = await publicClient.createAccessList({
  blockTag: 'safe', // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeef',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### data (optional)

- **Type:** `0x${string}`

Contract function selector with encoded arguments.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const result = await publicClient.createAccessList({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeef', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther, parseGwei } from 'viem'

const result = await publicClient.createAccessList({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeef',
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther, parseGwei } from 'viem'

const result = await publicClient.createAccessList({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeef',
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther, parseGwei } from 'viem'

const result = await publicClient.createAccessList({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeef',
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### to (optional)

- **Type:** [`Address`](/docs/glossary/types#address)

Transaction recipient.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const result = await publicClient.createAccessList({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeef',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
})
```

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const result = await publicClient.createAccessList({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeef',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') // [!code focus]
})
```


