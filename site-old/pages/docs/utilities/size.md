---
description: Retrieves the size of the value (in bytes).
---

# size

Retrieves the size of the value (in bytes).

## Install

```ts
import { size } from 'viem'
```

## Usage

```ts
import { size } from 'viem'

size('0xa4') // 1
size('0xa4e12a45') // 4
size(new Uint8Array([1, 122, 51, 123])) // 4
```

## Returns

`number`

The size of the value (in bytes).

## Parameters

### value

- **Type:** [`Hex`](/docs/glossary/types#hex) | `ByteArray`

The value (hex or byte array) to retrieve the size of.



