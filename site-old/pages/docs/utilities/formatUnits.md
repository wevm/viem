---
description: Divides a number by a given exponent of base 10, and formats it into a string representation of the number.
---

# formatUnits

Divides a number by a given exponent of base 10 (10<sup>exponent</sup>), and formats it into a string representation of the number.

## Import

```ts
import { formatUnits } from 'viem'
```

## Usage

```ts
import { formatUnits } from 'viem'

formatUnits(420000000000n, 9) // [!code focus:2]
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