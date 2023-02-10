# isBytes

Checks whether the value is a byte array or not.

## Install

```ts
import { isBytes } from 'viem/utils'
```

## Usage

```ts
import { isBytes } from 'viem/utils'

isBytes(new Uint8Array([1, 69, 420]))
// true

isBytes([1, 69, 420])
// false
```

## Returns

`boolean`

Returns truthy is the value is a byte array.