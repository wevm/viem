# signTransaction (Local Account) [Signs a transaction with the Account's private key.]

Signs a transaction with the Account's private key.

## Usage

```ts twoslash
import { parseGwei } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const account = privateKeyToAccount('0x...')

const signature = await account.signTransaction({
  chainId: 1,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('3'),
  gas: 21000n,
  nonce: 69,
  to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
// @log: Output: "0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33"
```

### Custom serializer

viem has a built-in serializer for **Legacy**, **EIP-2930** (`0x01`) and **EIP-1559** (`0x02`) transaction types. If you would like to serialize on another transaction type that viem does not support internally, you can pass a custom serializer.

```ts 
import { parseGwei } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const account = privateKeyToAccount('0x...')

const signature = await account.signTransaction({
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('3'),
  gas: 21000n,
  nonce: 69,
  to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
}, {
  serializer(transaction) { // [!code focus:16]
    const {
      chainId,
      nonce,
      // ...
    } = transaction

    return concatHex([
      '0x69',
      toRlp([
        toHex(chainId),
        nonce ? toHex(nonce) : '0x',
        // ...
      ]),
    ])
  }
})
```

## Returns

[`Hex`](/docs/glossary/types#Hex)

The signed transaction.

## Parameters

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#accesslist)

The access list.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  accessList: [ // [!code focus:6]
    {
      address: '0x1',
      storageKeys: ['0x1'],
    },
  ],
  chainId: 1,
})
```

### authorizationList (optional)

- **Type:** `AuthorizationList`

Signed EIP-7702 Authorization list.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const authorization = await account.experimental_signAuthorization({
  contractAddress: '0x...',
  chainId: 1,
  nonce: 1,
})

const signature = await account.signTransaction({
  authorizationList: [authorization], // [!code focus]
  chainId: 1,
})
```

### blobs (optional)

- **Type:** `Hex[]`

Blobs for [Blob Transactions](/docs/guides/blob-transactions). 

```ts
import * as cKzg from 'c-kzg'
import { toBlobs, setupKzg, stringToHex } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetupPath) 

const hash = await account.signTransaction({
  blobs: toBlobs({ data: stringToHex('blobby blob!') }), // [!code focus]
  kzg,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### chainId (optional)

- **Type:** `number`

The chain ID.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  chainId: 1, // [!code focus]
})
```

### data (optional)

- **Type:** `0x${string}`

Transaction data.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // [!code focus]
})
```

### gas (optional)

- **Type:** `bigint`

The gas limit for the transaction.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  gas: 69420n, // [!code focus]
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts twoslash
import { parseGwei } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  gasPrice: parseGwei('20'), // [!code focus]
})
```

### kzg (optional)

- **Type:** `KZG`

KZG implementation for [Blob Transactions](/docs/guides/blob-transactions). 

See [`setupKzg`](/docs/utilities/setupKzg) for more information.

```ts
import * as cKzg from 'c-kzg'
import { toBlobs, setupKzg, stringToHex } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetupPath) // [!code focus]

const signature = await account.signTransaction({
  blobs: toBlobs({ data: stringToHex('blobby blob!') }), // [!code focus]
  kzg, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts twoslash
import { parseGwei } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  chainId: 1,
  maxFeePerGas: parseGwei('20'), // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts twoslash
import { parseGwei } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  chainId: 1,
  maxPriorityFeePerGas: parseGwei('3'), // [!code focus]
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  nonce: 69 // [!code focus]
})
```

### to (optional)

- **Type:** `Address`

The transaction recipient.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  to: '0x...' // [!code focus]
})
```

### type (optional)

- **Type:** `"legacy" | "eip2930" | "eip1559"`

The transaction type.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  type: 'eip1559' // [!code focus]
})
```

### value (optional)

- **Type:** `bigint`

Value in wei sent with this transaction.

```ts twoslash
import { parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signTransaction({
  value: parseEther('1'), // [!code focus]
})
```
