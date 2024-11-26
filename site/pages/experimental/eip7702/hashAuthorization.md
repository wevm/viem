---
description: Calculates an Authorization object hash in EIP-7702 format.
---

# hashAuthorization

Calculates an Authorization hash in [EIP-7702 format](https://eips.ethereum.org/EIPS/eip-7702): `keccak256('0x05' || rlp([chain_id, address, nonce]))`.

## Import

```ts twoslash
import { hashAuthorization } from 'viem/experimental'
```

## Usage

```ts twoslash
import { hashAuthorization } from 'viem/experimental'

hashAuthorization({
  contractAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  chainId: 1,
  nonce: 0,
})
// 0xd428ed36e6098e46b40a4cb99b83b930b0ca1f054f40b5996589eda33c295663
```

## Returns

[`Hash`](/docs/glossary/types#hash)

The hashed Authorization.

## Parameters

### address

- **Type:** `Address`

Address of the contract to set as code for the Authority.

```ts twoslash
import { hashAuthorization } from 'viem/experimental'

hashAuthorization({
  contractAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // [!code focus]
  chainId: 1,
  nonce: 0,
}) 
```

### chainId

- **Type:** `number`

Chain ID to authorize.

```ts twoslash
import { hashAuthorization } from 'viem/experimental'

hashAuthorization({
  contractAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  chainId: 1, // [!code focus]
  nonce: 0,
}) 
```

### nonce

- **Type:** `number`

Nonce of the Authority to authorize.

```ts twoslash
import { hashAuthorization } from 'viem/experimental'

hashAuthorization({
  contractAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  chainId: 1,
  nonce: 0, // [!code focus]
}) 
```

### to

- **Type:** `"hex" | "bytes"`
- **Default:** `"hex"`

Output format.

```ts twoslash
import { hashAuthorization } from 'viem/experimental'

hashAuthorization({
  contractAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  chainId: 1,
  nonce: 0, 
  to: 'bytes', // [!code focus]
}) 
```