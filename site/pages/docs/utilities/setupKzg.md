---
description: Sets up and returns a KZG interface.
---

# setupKzg

Sets up and defines a [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844) compatible [KZG interface](https://notes.ethereum.org/@vbuterin/proto_danksharding_faq#How-%E2%80%9Ccomplicated%E2%80%9D-and-%E2%80%9Cnew%E2%80%9D-is-KZG). The KZG interface is used in the blob transaction signing process to generate KZG commitments & proofs.

`setupKzg` accepts a KZG interface that implements three functions:

- `loadTrustedSetup`: A function to initialize the KZG trusted setup.
- `blobToKzgCommitment`: A function that takes a blob and returns it's KZG commitment.
- `computeBlobKzgProof`: A function that takes a blob and it's commitment, and returns the KZG proof.

A couple of KZG implementations we recommend are:
- [c-kzg](https://github.com/ethereum/c-kzg-4844): Node.js bindings to c-kzg.
- [kzg-wasm](https://github.com/ethereumjs/kzg-wasm): WebAssembly bindings to c-kzg.

## Import

```ts twoslash
import { setupKzg } from 'viem'
```

## Usage

```ts twoslash
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)
```

### Trusted Setups

As seen above, when you set up your KZG interface, you will need to provide a trusted setup file. You can either import a trusted setup via the [`viem/node` entrypoint](#viemnode-entrypoint) (if you're using an engine that supports Node.js' `node:fs` module), or you can directly import the trusted setup `.json` via the [`viem/trusted-setups` entrypoint](#viemtrusted-setups-entrypoint).

Viem exports the following trusted setups:

- `mainnet.json`: For Ethereum Mainnet & it's Testnets (Sepolia, Goerli, etc).
- `minimal.json`: For low-resource local dev testnets, and spec-testing.

The trusted setup files are retrieved from the Ethereum [consensus-specs repository](https://github.com/ethereum/consensus-specs/tree/dev/presets).

#### `viem/node` Entrypoint

Viem exports **paths to the trusted setup** via the `viem/node` entrypoint, designed to be used with `setupKzg`. 

```ts
import {
  mainnetTrustedSetupPath,
  minimalTrustedSetupPath,
} from 'viem/node'
```

#### `viem/trusted-setups` Entrypoint

Alternatively, you can directly import the **contents of the trusted setup** file from the `viem/trusted-setups` entrypoint.

```ts
import mainnetTrustedSetup from 'viem/trusted-setups/mainnet.json'
import minimalTrustedSetup from 'viem/trusted-setups/minimal.json'
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
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(
  cKzg, // [!code focus]
  mainnetTrustedSetupPath
)
```

### path

- **Type:** `string`

The path to the trusted setup file. 

```ts twoslash
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node' // [!code focus]

const kzg = setupKzg(
  cKzg, 
  mainnetTrustedSetupPath // [!code focus]
)
```

