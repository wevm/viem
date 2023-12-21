---
head:
  - - meta
    - property: og:title
      content: formatGwei
  - - meta
    - name: description
      content: Converts numerical wei to a string representation of gwei.
  - - meta
    - property: og:description
      content: Converts numerical wei to a string representation of gwei.

---

# formatGwei

Converts numerical wei to a string representation of gwei.

## Import

```ts
import { formatGwei } from 'viem'
```

## Usage

```ts
import { formatGwei } from 'viem'

formatGwei(1000000000n) // [!code focus:2]
// '1'
```

## Returns

`string`

## Parameters

### value

- **Type:** `bigint`

The gwei value.