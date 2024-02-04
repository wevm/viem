---
description: Sets up and returns a KZG interface.
---

# setupKzg

Sets up and defines a [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844) compatible [KZG interface](https://notes.ethereum.org/@vbuterin/proto_danksharding_faq#How-%E2%80%9Ccomplicated%E2%80%9D-and-%E2%80%9Cnew%E2%80%9D-is-KZG). The KZG interface is used in the blob transaction signing process to generate KZG commitments & proofs.

`setupKzg` accepts a KZG interface that implements three functions:

- `loadTrustedSetup`: A function to initialize the KZG trusted setup.
- `blobToKzgCommitment`: A function that takes a blob and returns it's KZG commitment.
- `computeBlobKzgProof`: A function that takes a blob and it's commitment, and returns the KZG proof.

One of the most common KZG implementations for EIP-4844 is [c-kzg](https://github.com/ethereum/c-kzg-4844) – we recommend using it.

:::warning[Warning]
`c-kzg` only offers Node.js bindings. There are currently no known pure JavaScript or WebAssembly KZG implementations. This means you won't be able to use KZG in the browser. 
:::

## Import

```ts twoslash
import { setupKzg } from 'viem'
```

## Usage

```ts twoslash
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetup } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetup)
```

## Returns

`Kzg`

The KZG interface.

## Parameters

### kzg

- **Type:** `Kzg & { loadTrustedSetup(path: string): void }`

The [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844) compatible [KZG interface](https://notes.ethereum.org/@vbuterin/proto_danksharding_faq#How-%E2%80%9Ccomplicated%E2%80%9D-and-%E2%80%9Cnew%E2%80%9D-is-KZG).

```ts twoslash
import * as cKzg from 'c-kzg' // [!code focus]
import { setupKzg } from 'viem'
import { mainnetTrustedSetup } from 'viem/node'

const kzg = setupKzg(
  cKzg, // [!code focus]
  mainnetTrustedSetup
)
```

### path

- **Type:** `string`

The path to the trusted setup file. 

```ts twoslash
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetup } from 'viem/node' // [!code focus]

const kzg = setupKzg(
  cKzg, 
  mainnetTrustedSetup // [!code focus]
)
```

