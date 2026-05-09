---
description: Generates random EIP-4361 nonce.
---

# generateSiweNonce

Generates random [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) nonce.

## Import

```ts twoslash
import { generateSiweNonce } from 'viem/siwe'
```

## Usage

```ts twoslash
import { generateSiweNonce } from 'viem/siwe'

const nonce = generateSiweNonce()
```

## Returns

`string`

A randomly generated EIP-4361 nonce.
