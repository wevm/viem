---
head:
  - - meta
    - property: og:title
      content: verifyTypedData
  - - meta
    - name: description
      content: Verifies a typed data signature
  - - meta
    - property: og:description
      content: Verifies a typed data signature
---

# verifyTypedData

Verify that typed data was signed by the provided address.

::: info 💡 Why should I use this over the [`verifyTypedData`](../../utilities/verifyTypedData.md) util?
This Action supports verifying typed data that was signed by either a Smart Contract Account or Externally Owned Account (via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492)). The [`verifyTypedData`](../../utilities/verifyTypedData.md) util only supports Externally Owned Accounts. This is getting increasingly important as more wallets implement [Account Abstraction](https://eips.ethereum.org/EIPS/eip-4337). 
:::

## Usage

::: code-group

```ts [example.ts]
import { account, walletClient, publicClient } from './client'

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
const valid = await publicClient.verifyTypedData({
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
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const walletClient = createWalletClient({
  transport: custom(window.ethereum)
})

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

## Returns

`boolean`

Wheather the signed message is valid for the given address.

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

- **Type:** `Hex | ByteArray`

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

## JSON-RPC Method

[`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call) to a deployless [universal signature validator contract](https://eips.ethereum.org/EIPS/eip-6492).