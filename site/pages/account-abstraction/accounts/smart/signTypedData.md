# signTypedData (Smart Account)

Signs typed data and calculates an Ethereum-specific signature in [https://eips.ethereum.org/EIPS/eip-712](https://eips.ethereum.org/EIPS/eip-712): `sign(keccak256("\x19\x01" ‖ domainSeparator ‖ hashStruct(message)))`

Uses the Smart Account's **Owner** to sign the message.

## Usage

:::code-group

```ts twoslash [example.ts]
// @twoslash-cache: {"v":1,"hash":"89d3f109c63ea822ba1675e2a36c0110998715b2f6edee8d3263bad2fdf25df4","data":"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"}
import { toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { client, owner } from './config.js'
import { domain, types } from './data.js'

const account = await toCoinbaseSmartAccount({
  client,
  owners: [owner],
  version: '1.1',
})

const signature = await account.signTypedData({ // [!code focus]
  domain, // [!code focus]
  types, // [!code focus]
  primaryType: 'Mail', // [!code focus]
  message: { // [!code focus]
    from: { // [!code focus]
      name: 'Cow', // [!code focus]
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', // [!code focus]
    }, // [!code focus]
    to: { // [!code focus]
      name: 'Bob', // [!code focus]
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB', // [!code focus]
    }, // [!code focus]
    contents: 'Hello, Bob!', // [!code focus]
  }, // [!code focus]
}) // [!code focus]
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

```ts twoslash [config.ts] filename="config.ts"
// @twoslash-cache: {"v":1,"hash":"40392ee44a2b011ec18f9896577d7d98af128d94420bb916da4b5f5d4c56ce43","data":"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"}
import { http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const owner = privateKeyToAccount('0x...')
 
export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
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
