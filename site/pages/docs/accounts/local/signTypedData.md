# signTypedData (Local Account) [Signs typed data with the Account's private key.]

Signs typed data and calculates an Ethereum-specific signature in [https://eips.ethereum.org/EIPS/eip-712](https://eips.ethereum.org/EIPS/eip-712): `sign(keccak256("\x19\x01" ‖ domainSeparator ‖ hashStruct(message)))`

## Usage

:::code-group

```ts twoslash [example.ts]
// @twoslash-cache: {"v":1,"hash":"c61340cb66e9da4dfab1c9b8ce6453e67627ac67db7517d00ea1f411b787d8ac","data":"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"}
import { privateKeyToAccount } from 'viem/accounts'
import { domain, types } from './data'

const account = privateKeyToAccount('0x...')

const signature = await account.signTypedData({
  domain,
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
})
```

```ts twoslash [data.ts] filename="data.ts"
// @twoslash-cache: {"v":1,"hash":"e69c40d1e071e3501c8dbcb61580d8febbc7c5cba510f97327b660d316308520","data":"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="}
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

:::

## Returns

`0x${string}`

The signed data.

## Parameters

### domain

**Type:** `TypedDataDomain`

The typed data domain.

```ts
const signature = await account.signTypedData({
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
})
```

### types

The type definitions for the typed data.

```ts
const signature = await account.signTypedData({
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
})
```

### primaryType

**Type:** Inferred `string`.

The primary type to extract from `types` and use in `value`.

```ts
const signature = await account.signTypedData({
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
})
```

### message

**Type:** Inferred from `types` & `primaryType`.

```ts
const signature = await account.signTypedData({
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
})
```
