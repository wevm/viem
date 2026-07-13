---
description: Transforms a list of sidecars to their versioned hashes.
---

# sidecarsToVersionedHashes

Transforms a list of sidecars to their versioned hashes.

## Import

```ts twoslash
import { sidecarsToVersionedHashes } from 'viem'
```

## Usage

:::code-group

```ts twoslash [example.ts]
import { toBlobSidecars, sidecarsToVersionedHashes } from 'viem'
import { kzg } from './kzg'

const sidecars = toBlobSidecars({ data: '0x...', kzg })
const versionedHashes = sidecarsToVersionedHashes({ sidecars }) // [!code focus]
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

`Hex[] | ByteArray[]`

Versioned hashes from the input sidecars.

## Parameters

### sidecars

- **Type:** `BlobSidecars<Hex | ByteArray>`

Sidecars to transform to versioned hashes.

```ts twoslash 
import { toBlobSidecars, sidecarsToVersionedHashes } from 'viem'
import { kzg } from './kzg'

const sidecars = toBlobSidecars({ data: '0x...', kzg })

const versionedHashes = sidecarsToVersionedHashes({ 
  sidecars, // [!code focus]
})
```

### to

- **Type:** `"bytes" | "hex"`

Commitments corresponding to the input blobs.

```ts twoslash 
import { toBlobSidecars, sidecarsToVersionedHashes } from 'viem'
import { kzg } from './kzg'

const sidecars = toBlobSidecars({ data: '0x...', kzg })

const versionedHashes = sidecarsToVersionedHashes({ 
  sidecars,
  to: 'bytes', // [!code focus]
})
versionedHashes  // [!code focus]
// ^?


```

### version

- **Type:** `number`
- **Default:** `1`

Version to tag onto the hashes. Defaults to `1`.

```ts twoslash 
import { toBlobSidecars, sidecarsToVersionedHashes } from 'viem'
import { kzg } from './kzg'

const sidecars = toBlobSidecars({ data: '0x...', kzg })

const versionedHashes = sidecarsToVersionedHashes({ 
  sidecars,
  version: 69, // [!code focus]
})
```
