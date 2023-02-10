# formatGwei

Converts numerical wei to a string representation of gwei.

## Import

```ts
import { formatGwei } from 'viem/utils'
```

## Usage

```ts
import { formatGwei } from 'viem/utils'

formatGwei(1000000000n) // [!code focus:2]
// '1'
```

## Returns

`string`

## Parameters

### value

- **Type:** `bigint`

The gwei value.