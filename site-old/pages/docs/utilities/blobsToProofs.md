---
description: Compute the proofs for a list of blobs and their commitments.
---

# blobsToProofs

Compute the proofs for a list of blobs and their commitments.

## Import

```ts twoslash
import { blobsToProofs } from 'viem'
```

## Usage

:::code-group

```ts twoslash [example.ts]
import { blobsToCommitments, blobsToProofs, toBlobs } from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x...' })
const commitments = blobsToCommitments({ blobs, kzg })
const proofs = blobsToProofs({ blobs, commitments, kzg }) // [!code focus]
```

```ts twoslash [kzg.ts] filename="kzg.ts"
// @noErrors
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'

export const kzg = setupKzg('./trusted-setup.json', cKzg)
```

:::

## Returns

`Hex[] | ByteArray[]`

Proofs from the input blobs and commitments.

## Parameters

### blobs

- **Type:** `Hex[] | ByteArray[]`

Blobs to transform into proofs.

```ts twoslash
import { blobsToCommitments, blobsToProofs, toBlobs } from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x...' }) // [!code focus]
const commitments = blobsToCommitments({ blobs, kzg })

const proofs = blobsToProofs({ 
  blobs, // [!code focus]
  commitments, 
  kzg 
})
```

### commitments

- **Type:** `Hex[] | ByteArray[]`

Commitments corresponding to the input blobs.

```ts twoslash
import { blobsToCommitments, blobsToProofs, toBlobs } from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x...' })
const commitments = blobsToCommitments({ blobs, kzg }) // [!code focus]

const proofs = blobsToProofs({ 
  blobs,
  commitments,  // [!code focus]
  kzg 
})
```

### kzg

- **Type:** `KZG`

KZG implementation. See [`setupKzg`](/docs/utilities/setupKzg) for more information.

```ts twoslash
// @noErrors
import * as cKzg from 'c-kzg'
import { blobsToProofs, setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const blobs = toBlobs({ data: '0x...' })
const kzg = setupKzg(cKzg, mainnetTrustedSetupPath) // [!code focus]
const commitments = blobsToCommitments({ blobs, kzg })

const proofs = blobsToProofs({ 
  blobs,
  commitments,
  kzg, // [!code focus]
}) 
```
