# hexToNumber

Converts a hex encoded value to a number.

## Import

```ts
import { hexToNumber } from 'viem'
```

## Usage

```ts
import { hexToNumber } from 'viem'

hexToNumber('0x1a4') // [!code focus:2]
// 420
```

## Returns

`number`

The decoded number.

## Arguments

### value

- **Type:** `"0x${string}"`

The hex encoded number.