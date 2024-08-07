---
description: Hashes EIP-712 typed data via Solady's ERC-1271 format.
---

# hashTypedData

Hashes [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data via [ERC-7739 `TypedDataSign` format](https://eips.ethereum.org/EIPS/eip-7739).

## Import

```ts
import { hashTypedData } from 'viem/experimental/solady'
```

## Usage

```ts
import { hashTypedData } from 'viem/experimental/solady'

hashTypedData({
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
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
  extensions: [],
  fields: '0x0f',
  verifierDomain: {
    name: 'Smart Account',
    version: '1',
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
    chainId: 1,
  },
})
```

## Returns

[`Hex`](/docs/glossary/types#hex)

A signable typed data hash.

## Parameters

### domain

**Type:** `TypedDataDomain`

The typed data domain.

```ts
const hash = hashTypedData({
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
  extensions: [],
  fields: '0x0f',
  verifierDomain: {
    name: 'Smart Account',
    version: '1',
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
    chainId: 1,
  },
})
```

### types

The type definitions for the typed data.

```ts
const hash = hashTypedData({
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
  extensions: [],
  fields: '0x0f',
  verifierDomain: {
    name: 'Smart Account',
    version: '1',
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
    chainId: 1,
  },
})
```

### primaryType

**Type:** Inferred `string`.

The primary type to extract from `types` and use in `value`.

```ts
const hash = hashTypedData({
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
  extensions: [],
  fields: '0x0f',
  verifierDomain: {
    name: 'Smart Account',
    version: '1',
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
    chainId: 1,
  },
})
```

### message

**Type:** Inferred from `types` & `primaryType`.

```ts
const hash = hashTypedData({
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
  extensions: [],
  fields: '0x0f',
  verifierDomain: {
    name: 'Smart Account',
    version: '1',
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
    chainId: 1,
  },
})
```

### extensions

**Type:** `readonly bigint[]`

Extensions for the typed data.

```ts
const hash = hashTypedData({
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
  extensions: [], // [!code focus]
  fields: '0x0f',
  verifierDomain: {
    name: 'Smart Account',
    version: '1',
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
    chainId: 1,
  },
})
```

### fields

**Type:** `Hex`

Typed data fields.

```ts
const hash = hashTypedData({
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
  extensions: [],
  fields: '0x0f',  // [!code focus]
  verifierDomain: {
    name: 'Smart Account',
    version: '1',
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
    chainId: 1,
  },
})
```

### verifierDomain

**Type:** `TypedDataDomain`

Domain of the verifying contract.

```ts
const hash = hashTypedData({
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
  extensions: [],
  fields: '0x0f', 
  verifierDomain: { // [!code focus]
    name: 'Smart Account', // [!code focus]
    version: '1', // [!code focus]
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678', // [!code focus]
    chainId: 1, // [!code focus]
  }, // [!code focus]
})
```
