---
description: Compute commitments from a list of blobs.
---

# blobsToCommitments

Compute commitments from a list of blobs.

## Import

```ts twoslash
import { blobsToCommitments } from 'viem'
```

## Usage

:::code-group

```ts twoslash [example.ts]
import { blobsToCommitments, toBlobs } from 'viem'
import { kzg } from './kzg'

const blobs = toBlobs({ data: '0x1234' })
const commitments = blobsToCommitments({ blobs, kzg }) // [!code focus]
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

List of commitments corresponding to the input blobs.

## Parameters

### blobs

- **Type:** `Hex[] | ByteArray[]`

List of blobs to transform into commitments.

```ts twoslash
import { defineKzg } from 'viem'
const kzg = defineKzg({} as any)

// ---cut---
import { blobsToCommitments, toBlobs } from 'viem'

const commitments = blobsToCommitments({ 
  blobs: toBlobs({ data: '0x1234' }), // [!code focus]  
  kzg, 
}) 
```

### kzg

- **Type:** `KZG`

KZG implementation. See [`setupKzg`](/docs/utilities/setupKzg) for more information.

```ts twoslash
// @noErrors
import * as cKzg from 'c-kzg'
import { blobsToCommitments, setupKzg, toBlobs } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetupPath) // [!code focus]

const commitments = blobsToCommitments({ 
  blobs: toBlobs({ data: '0x1234' }),  
  kzg, // [!code focus]
}) 
```

### to

- **Type:** `"bytes" | "hex"`

The output type.

```ts twoslash
import { defineKzg } from 'viem'
const kzg = defineKzg({} as any)

// ---cut---
import { blobsToCommitments, toBlobs } from 'viem'

const commitments = blobsToCommitments({ 
  blobs: toBlobs({ data: '0x1234' }),
  kzg, 
  to: 'bytes', // [!code focus]  
}) 

commitments // [!code focus]
// ^?


```