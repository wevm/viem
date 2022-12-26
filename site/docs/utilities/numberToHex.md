# numberToHex

Converts a number to a hex encoded value.

## Import

```ts
import { numberToHex } from 'viem'
```

## Usage

```ts
import { numberToHex } from 'viem'

numberToHex(420) // [!code focus:2]
// '0x1a4'
```

## Returns

`string`

The hex encoded number.

## Arguments

### value

- **Type:** `number | bigint`

The number to hex encode.