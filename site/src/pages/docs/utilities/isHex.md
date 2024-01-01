---
description: Checks whether the value is a hex value or not.
---

# isHex

Checks whether the value is a hex value or not.

## Install

```ts
import { isHex } from 'viem'
```

## Usage

```ts
import { isHex } from 'viem'

isHex('0x1a4')
// true

isHex('0x1a4z')
isHex('foo')
// false
```

## Returns

`boolean`

Returns truthy is the value is a hex value.

## Parameters

### value

- **Type:** `unknown`

The value to check.

```ts
isHex(
  '0x1a4' // [!code focus]
)
// true
```

### options.strict

- **Type:** `boolean`
- **Default:** `true`

When enabled, checks if the value strictly consists of only hex characters (`"0x[0-9a-fA-F]*"`).
When disabled, checks if the value loosely matches hex format (`value.startsWith('0x')`).

```ts
isHex('0xlol', { strict: false })
// true

isHex('0xlol', { strict: true })
// false

isHex('lol', { strict: false })
// false
```