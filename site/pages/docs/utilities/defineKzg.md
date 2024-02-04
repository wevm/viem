---
description: Defines a KZG interface.
---

# defineKzg

Defines a [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844) compatible [KZG interface](https://notes.ethereum.org/@vbuterin/proto_danksharding_faq#How-%E2%80%9Ccomplicated%E2%80%9D-and-%E2%80%9Cnew%E2%80%9D-is-KZG). The KZG interface is used in the blob transaction signing process to generate KZG commitments & proofs.

`defineKzg` accepts a KZG interface that implements two functions:

- `blobToKzgCommitment`: A function that takes a blob and returns it's KZG commitment.
- `computeBlobKzgProof`: A function that takes a blob and it's commitment, and returns the KZG proof.

One of the most common KZG implementations for EIP-4844 is [c-kzg](https://github.com/ethereum/c-kzg-4844) – we recommend using it.

:::warning[Warning]
`c-kzg` only offers Node.js bindings. There are currently no known pure JavaScript or WebAssembly KZG implementations. This means you won't be able to use KZG in the browser. 
:::

## Import

```ts twoslash
import { defineKzg } from 'viem'
```

## Usage

```ts twoslash
import * as cKzg from 'c-kzg'
import { defineKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

cKzg.loadTrustedSetup(mainnetTrustedSetupPath)

const kzg = defineKzg(cKzg)
```

## Returns

`Kzg`

The KZG interface.

## Parameters

### blobToKzgCommitment

- **Type:** `(blob: ByteArray) => ByteArray`

Convert a blob to a KZG commitment.

### computeBlobKzgProof

- **Type:** `(blob: ByteArray, commitment: ByteArray) => ByteArray`

Given a blob, return the KZG proof that is used to verify it against the commitment.