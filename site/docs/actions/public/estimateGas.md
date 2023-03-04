---
head:
  - - meta
    - property: og:title
      content: estimateGas
  - - meta
    - name: description
      content: An Action for estimating gas for a transaction.
  - - meta
    - property: og:description
      content: An Action for estimating gas for a transaction.

---

# estimateGas

Estimates the gas necessary to complete a transaction without submitting it to the network.

## Usage

```ts
import { getAccount } from 'viem'
import { publicClient } from '.'
 
const gasEstimate = await publicClient.estimateGas({ // [!code focus:7]
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

## Returns

`bigint`

The gas estimate (in wei).

## Parameters

### data (optional)

- **Type:** `0x${string}`

Contract code or a hashed method call with encoded args.

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  data: '0x...', // [!code focus]
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### from (optional)

- **Type:** [`Address`](/docs/glossary/types#address)

Transaction sender.

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus)]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### to (optional)

- **Type:** [`Address`](/docs/glossary/types#address)

Transaction recipient.

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
  value: parseEther('1')
})
```

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the gas estimate against.

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  blockNumber: 15121123n, // [!code focus]
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the gas estimate against.

```ts
import { getAccount } from 'viem'

const gasEstimate = await publicClient.estimateGas({
  blockTag: 'safe', // [!code focus]
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

## JSON-RPC Methods

[`eth_estimateGas`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas)