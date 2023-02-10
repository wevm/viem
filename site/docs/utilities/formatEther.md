# formatEther

Converts numerical wei to a string representation of ether.

## Import

```ts
import { formatEther } from 'viem/utils'
```

## Usage

```ts
import { formatEther } from 'viem/utils'

formatEther(1000000000000000000n) // [!code focus:2]
// '1'
```

## Returns

`string`

## Parameters

### value

- **Type:** `bigint`

The wei value.