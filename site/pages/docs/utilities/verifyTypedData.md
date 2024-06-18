---
description: Verifies a typed data signature
---

# verifyTypedData

Verify that typed data was signed by the provided address.

:::warning[Warning]
This utility can only verify typed data that was signed by an Externally Owned Account (EOA).
To verify messages from Contract Accounts (& EOA), use the [`publicClient.verifyTypedData` Action](/docs/actions/public/verifyTypedData) instead.
:::

## Usage

:::code-group

```ts [example.ts]
import { verifyTypedData } from 'viem'
import { account, walletClient } from './client'

const message = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  },
  contents: 'Hello, Bob!',
} as const

const signature = await walletClient.signTypedData({
  account,
  domain,
  types,
  primaryType: 'Mail',
  message,
})
// [!code focus:99]
const valid = await verifyTypedData({
  address: account.address,
  domain,
  types,
  primaryType: 'Mail',
  message,
  signature,
})
// true
```

```ts [data.ts]
// All properties on a domain are optional
export const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const

// The named list of all type definitions
export const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'

export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

export const walletClient = createWalletClient({
  transport: custom(window.ethereum),
})
```

:::

## Returns

`boolean`

Whether the provided `address` generated the `signature`.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The Ethereum address that signed the original message.

```ts
const valid = await verifyTypedData({
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus:1]
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types,
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  signature: '0x...',
})
```

### domain

**Type:** `TypedDataDomain`

The typed data domain.

```ts
const valid = await verifyTypedData({
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: { // [!code focus:6]
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types,
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  signature: '0x...',
})
```

### types

The type definitions for the typed data.

```ts
const valid = await verifyTypedData({
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain,
  types: { // [!code focus:11]
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  signature: '0x...',
})
```

### primaryType

**Type:** Inferred `string`.

The primary type to extract from `types` and use in `value`.

```ts
const valid = await verifyTypedData({
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain,
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [ // [!code focus:5]
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail', // [!code focus]
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  signature: '0x...',
})
```

### message

**Type:** Inferred from `types` & `primaryType`.

```ts
const valid = await verifyTypedData({
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain,
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: { // [!code focus:11]
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  signature: '0x...',
})
```

### signature

- **Type:** `Hex | ByteArray | Signature`

The signature of the typed data.

```ts
const valid = await verifyTypedData({
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain,
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  signature: '0x...', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

Only used when verifying a typed data that was signed by a Smart Contract Account. The block number to check if the contract was already deployed.

```ts
const valid = await verifyTypedData({
  blockNumber: 42069n, // [!code focus]
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types,
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  signature: '0x...',
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Only used when verifying a typed data that was signed by a Smart Contract Account. The block tag to check if the contract was already deployed.

```ts
const valid = await verifyTypedData({
  blockNumber: 42069n, // [!code focus]
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types,
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  signature: '0x...',
})
```

## JSON-RPC Method

[`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call) to a deployless [universal signature validator contract](https://eips.ethereum.org/EIPS/eip-6492).
