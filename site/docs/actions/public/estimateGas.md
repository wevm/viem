# estimateGas

Estimates the gas necessary to complete a transaction without submitting it to the network.

## Usage

```ts
import { publicClient } from '.'
 
const gasEstimate = await publicClient.estimateGas({ // [!code focus:7]
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
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
const gasEstimate = await publicClient.estimateGas({
  data: '0x...', // [!code focus]
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### from (optional)

- **Type:** `Address`

Transaction sender.

```ts
const gasEstimate = await publicClient.estimateGas({
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#TODO).

```ts
const gasEstimate = await publicClient.estimateGas({
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#TODO)

```ts
const gasEstimate = await publicClient.estimateGas({
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#TODO)

```ts
const gasEstimate = await publicClient.estimateGas({
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### to (optional)

- **Type:** `Address`

Transaction recipient.

```ts
const gasEstimate = await publicClient.estimateGas({
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
  value: parseEther('1')
})
```

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts
const gasEstimate = await publicClient.estimateGas({
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the gas estimate against.

```ts
const gasEstimate = await publicClient.estimateGas({
  blockNumber: 15121123n, // [!code focus]
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the gas estimate against.

```ts
const gasEstimate = await publicClient.estimateGas({
  blockTag: 'safe', // [!code focus]
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```