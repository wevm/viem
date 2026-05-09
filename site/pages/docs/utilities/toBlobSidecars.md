---
description: Transforms arbitrary data into blob sidecars.
---

# toBlobSidecars

Transforms arbitrary data (or blobs, commitments, & proofs) into a blob sidecar array.

## Import

```ts twoslash
import { toBlobSidecars } from 'viem'
```

## Usage

### With Arbitrary Data

You can generate blob sidecars from arbitrary data without having to compute the blobs, commitments, and proofs first (that's done internally).

:::code-group

```ts twoslash [example.ts]
import { toBlobSidecars } from 'viem'
import { kzg } from './kzg'

const sidecars = toBlobSidecars({ data: '0x...', kzg }) // [!code focus]
```

```ts twoslash [kzg.ts] filename="kzg.ts"
// @noErrors
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

export const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)
```

:::

### With Blobs, Commitments, and Proofs

Alternatively, you can reach for the lower-level API and insert the blobs, commitments, and proofs directly.

:::code-group

```ts twoslash [example.ts]
import { 
  blobsToCommitments, 
  blobsToProofs,
  toBlobSidecars, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x...' })
const commitments = blobsToCommitments({ blobs, kzg })
const proofs = blobsToProofs({ blobs, commitments, kzg })
const sidecars = toBlobSidecars({ blobs, commitments, proofs }) // [!code focus]
```

```ts twoslash [kzg.ts] filename="kzg.ts"
// @noErrors
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

export const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)
```

:::

## Returns

`BlobSidecars`

Blob sidecars from the input data.

## Parameters

### blobs

- **Type:** `Hex[] | ByteArray[]`

Blobs to transform into blob sidecars.

```ts twoslash
import { 
  blobsToCommitments, 
  blobsToProofs,
  toBlobSidecars, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x...' }) // [!code focus]
const commitments = blobsToCommitments({ blobs, kzg })
const proofs = blobsToProofs({ blobs, commitments, kzg })

const sidecars = toBlobSidecars({ 
  blobs, // [!code focus]
  commitments,
  proofs,
})
```

### commitments

- **Type:** `Hex[] | ByteArray[]`

Commitments corresponding to the input blobs.

```ts twoslash
import { 
  blobsToCommitments, 
  blobsToProofs,
  toBlobSidecars, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x...' })
const commitments = blobsToCommitments({ blobs, kzg }) // [!code focus]
const proofs = blobsToProofs({ blobs, commitments, kzg })

const sidecars = toBlobSidecars({ 
  blobs,
  commitments, // [!code focus]
  proofs,
})
```

### data

- **Type:** `Hex | ByteArray`

Data to transform into blob sidecars.

```ts twoslash
import { toBlobSidecars } from 'viem'
import { kzg } from './kzg'

const sidecars = toBlobSidecars({ 
  data: '0x...', // [!code focus]
  kzg,
})
```

### kzg

- **Type:** `KZG`

KZG implementation. See [`setupKzg`](/docs/utilities/setupKzg) for more information.

```ts twoslash
// @noErrors
import * as cKzg from 'c-kzg'
import { toBlobSidecars, setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetupPath) // [!code focus]

const sidecars = toBlobSidecars({ 
  data: '0x...',
  kzg, // [!code focus]
}) 
```

### proofs

- **Type:** `Hex[] | ByteArray[]`

Proofs corresponding to the input blobs.

```ts twoslash
import { 
  blobsToCommitments, 
  blobsToProofs,
  toBlobSidecars, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x...' })
const commitments = blobsToCommitments({ blobs, kzg })
const proofs = blobsToProofs({ blobs, commitments, kzg }) // [!code focus]

const sidecars = toBlobSidecars({ 
  blobs,
  commitments,
  proofs, // [!code focus]
})
```

### to

- **Type:** `"bytes" | "hex"`

The output type.

```ts twoslash
import { defineKzg } from 'viem'
const kzg = defineKzg({} as any)

// ---cut---
import { toBlobSidecars, toBlobs } from 'viem'

const sidecars = toBlobSidecars({ 
  data: '0x1234',
  kzg, 
  to: 'bytes', // [!code focus]  
}) 

sidecars // [!code focus]
// ^?


```