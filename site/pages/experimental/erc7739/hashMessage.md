---
description: Hashes an EIP-191 message via ERC-7739 format.
---

# hashMessage

Calculates a [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal sign hash via [ERC-7739 `PersonalSign` format](https://eips.ethereum.org/EIPS/eip-7739).

## Import

```ts
import { hashMessage } from 'viem/experimental/erc7739'
```

## Usage

```ts
import { hashMessage } from 'viem/experimental/erc7739'

// Hash a UTF-8 value.
hashMessage({ 
  message: 'hello world', 
  verifierDomain: { 
    name: 'Smart Account', 
    version: '1', 
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678', 
    chainId: 1, 
  }, 
}) 

// Hash a hex data value.
hashMessage({ 
  message: { raw: '0x68656c6c6f20776f726c64' }, 
  verifierDomain: { 
    name: 'Smart Account', 
    version: '1', 
    verifyingContract: '0x1234567890abcdef1234567890abcdef12345678', 
    chainId: 1, 
  }, 
}) 

// Hash a bytes data value.
hashMessage({ 
  message: {
    raw: Uint8Array.from([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ])
  }, 
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

A signable message hash.

## Parameters

### message

- **Type:** `string | { raw: Hex | ByteArray }`

Message to hash.

### verifierDomain

- **Type:** `TypedDataDomain`

The EIP-712 domain of the verifying contract.

 
