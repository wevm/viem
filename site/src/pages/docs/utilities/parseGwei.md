---
description: Converts a string representation of gwei to numerical wei.
---

# parseGwei

Converts a string representation of gwei to numerical wei.

## Import

```ts
import { parseGwei } from 'viem'
```

## Usage

```ts
import { parseGwei } from 'viem'

parseGwei('420') // [!code focus:2]
// 420000000000n
```

## Returns

`bigint`

## Parameters

### value

- **Type:** `string`

The string representation of gwei.