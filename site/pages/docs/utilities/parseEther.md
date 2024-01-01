---
description: Converts a string representation of ether to numerical wei.
---

# parseEther

Converts a string representation of ether to numerical wei.

## Import

```ts
import { parseEther } from 'viem'
```

## Usage

```ts
import { parseEther } from 'viem'

parseEther('420') // [!code focus:2]
// 420000000000000000000n
```

## Returns

`bigint`

## Parameters

### value

- **Type:** `string`

The string representation of ether.