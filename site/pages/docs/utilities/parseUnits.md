---
description: Multiplies a string representation of a number by a given exponent of base 10.
---

# parseUnits

Multiplies a string representation of a number by a given exponent of base 10 (10<sup>exponent</sup>).

## Import

```ts
import { parseUnits } from 'viem'
```

## Usage

```ts
import { parseUnits } from 'viem'

parseUnits('420', 9) // [!code focus:2]
// 420000000000n
```

## Returns

`bigint`

## Parameters

### value

- **Type:** `string`

The string representation of the number to multiply.

### exponent 

- **Type:** `number`

The exponent.