---
description: Transform a list of commitments to their versioned hashes.
---

# commitmentsToVersionedHashes

Transform a list of commitments to their versioned hashes.

## Import

```ts twoslash
import { commitmentsToVersionedHashes } from 'viem'
```

## Usage

:::code-group

```ts twoslash [example.ts]
import { 
  blobsToCommitments, 
  commitmentsToVersionedHashes, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x1234' })
const commitments = blobsToCommitments({ blobs, kzg })
const versionedHashes = commitmentsToVersionedHashes({  // [!code focus]
  commitments,  // [!code focus]
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

`Hex[] | ByteArray[]`

List of versioned hashes corresponding to the input commitments.

## Parameters

### commitments

- **Type:** `Hex[] | ByteArray[]`

List of commitments to transform into versioned hashes.

```ts twoslash
import { 
  blobsToCommitments, 
  commitmentsToVersionedHashes, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'
// ---cut---
const blobs = toBlobs({ data: '0x1234' })
const commitments = blobsToCommitments({ blobs, kzg })
const versionedHashes = commitmentsToVersionedHashes({ 
  commitments,  // [!code focus]
  kzg, 
})
```

### to

- **Type:** `"bytes" | "hex"`

The output type.

```ts twoslash
import { 
  blobsToCommitments, 
  commitmentsToVersionedHashes, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'
// ---cut---
const blobs = toBlobs({ data: '0x1234' })
const commitments = blobsToCommitments({ blobs, kzg })
const versionedHashes = commitmentsToVersionedHashes({ 
  commitments, 
  to: 'bytes' // [!code focus]
})
versionedHashes // [!code focus]
//  ^?


```

### version

- **Type:** `number`
- **Default:** `1`

Version to tag onto the hashes. Defaults to `1`.

```ts twoslash
import { 
  blobsToCommitments, 
  commitmentsToVersionedHashes, 
  toBlobs 
} from 'viem'
import { kzg } from './kzg'
// ---cut---
const blobs = toBlobs({ data: '0x1234' })
const commitments = blobsToCommitments({ blobs, kzg })
const versionedHashes = commitmentsToVersionedHashes({ 
  commitments, 
  version: 69, // [!code focus]
})
```