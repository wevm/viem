---
description: Transform a commitment to it's versioned hash.
---

# commitmentToVersionedHash

Transform a commitment to it's versioned hash.

## Import

```ts twoslash
import { commitmentToVersionedHash } from 'viem'
```

## Usage

:::code-group

```ts twoslash [example.ts]
import { 
  blobsToCommitments, 
  commitmentToVersionedHash, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x1234' })
const [commitment] = blobsToCommitments({ blobs, kzg })
const versionedHashes = commitmentToVersionedHash({  // [!code focus]
  commitment,  // [!code focus]
}) // [!code focus]
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

`Hex | ByteArray`

Versioned hash corresponding to the commitment.

## Parameters

### commitment

- **Type:** `Hex | ByteArray`

Commitment to transform into a versioned hash.

```ts twoslash
import { 
  blobsToCommitments, 
  commitmentToVersionedHash, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'
// ---cut---
const blobs = toBlobs({ data: '0x1234' })
const [commitment] = blobsToCommitments({ blobs, kzg })
const versionedHashes = commitmentToVersionedHash({ 
  commitment,  // [!code focus]
})
```

### to

- **Type:** `"bytes" | "hex"`

The output type.

```ts twoslash
import { 
  blobsToCommitments, 
  commitmentToVersionedHash, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'
// ---cut---
const blobs = toBlobs({ data: '0x1234' })
const [commitment] = blobsToCommitments({ blobs, kzg })
const versionedHashes = commitmentToVersionedHash({ 
  commitment, 
  to: 'bytes' // [!code focus]
})
versionedHashes // [!code focus]
//  ^?


```

### version

- **Type:** `number`
- **Default:** `1`

Version to tag onto the hash. Defaults to `1`.

```ts twoslash
import { 
  blobsToCommitments, 
  commitmentToVersionedHash, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'
// ---cut---
const blobs = toBlobs({ data: '0x1234' })
const [commitment] = blobsToCommitments({ blobs, kzg })
const versionedHashes = commitmentToVersionedHash({ 
  commitment, 
  version: 69, // [!code focus]
})
```