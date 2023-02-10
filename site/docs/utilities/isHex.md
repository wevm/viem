# isHex

Checks whether the value is a hex value or not.

## Install

```ts
import { isHex } from 'viem/utils'
```

## Usage

```ts
import { isHex } from 'viem/utils'

isHex('0x1a4')
// true

isHex('0x1a4z')
isHex('foo')
// false
```

## Returns

`boolean`

Returns truthy is the value is a hex value.