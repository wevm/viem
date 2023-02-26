---
head:
  - - meta
    - property: og:title
      content: call
  - - meta
    - name: description
      content: An Action for executing a new message call.
  - - meta
    - property: og:description
      content: An Action for executing a new message call.

---

# call

Executes a new message call immediately without submitting a transaction to the network.

## Usage

```ts
import { publicClient } from '.'
 
const data = await publicClient.call({ // [!code focus:7]
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

## Returns

`0x${string}`

The call data.

## Parameters

### data

- **Type:** `0x${string}`

A contract hashed method call with encoded args.

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // [!code focus]
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### from

- **Type:** `Address`

The sender.

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### to

- **Type:** `Address`

The contract address or recipient.

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
})
```

### accessList (optional)

- **Type:** `AccessList`

The access list.

```ts
const data = await publicClient.call({
  accessList: [ // [!code focus:6]
    {
      address: '0x1',
      storageKeys: ['0x1'],
    },
  ],
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### gas (optional)

- **Type:** `bigint`

The gas provided for transaction execution.

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  gas: 1_000_000n, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#TODO).

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#TODO).

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#TODO).

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### nonce (optional)

- **Type:** `bigint`

Unique number identifying this transaction.

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  nonce: 420n, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts
const data = await publicClient.call({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'), // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the call against.

```ts
const data = await publicClient.call({
  blockNumber: 15121123n, // [!code focus]
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the call against.

```ts
const data = await publicClient.call({
  blockTag: 'safe', // [!code focus]
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```