---
head:
  - - meta
    - property: og:title
      content: formatUnit
  - - meta
    - name: description
      content: Divides a number by a given exponent of base 10, and formats it into a string representation of the number.
  - - meta
    - property: og:description
      content: Divides a number by a given exponent of base 10, and formats it into a string representation of the number.

---

# formatUnit

Divides a number by a given exponent of base 10 (10<sup>exponent</sup>), and formats it into a string representation of the number.

## Import

```ts
import { formatUnit } from 'viem'
```

## Usage

```ts
import { formatUnit } from 'viem'

formatUnit(420000000000n, 9) // [!code focus:2]
// '420'
```

## Returns

`string`

## Parameters

### value

- **Type:** `bigint`

The number to divide.

### exponent 

- **Type:** `number`

The exponent.