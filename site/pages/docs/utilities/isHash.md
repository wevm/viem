---
description: Checks if a string is a valid 32-byte hex hash.
---

# isHash

Checks if a string is a valid 32-byte hex hash.

## Import

```ts
import { isHash } from 'viem'
```

## Usage

```ts
import { isHash } from 'viem'

isHash('0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68') // [!code focus:3]
// true

isHash('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac') // [!code focus:4]
// false
```

## Returns

`boolean`

Whether the string is a valid 32-byte hex hash.

## Parameters

### hash

The string to check.

- **Type:** `string`