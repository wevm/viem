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

### options.even

- **Type:** `boolean`
- **Default:** `false`

When enabled, also checks that the value has an even number of hex characters, so it encodes whole bytes. Useful for byte data (addresses, hashes, calldata), where `0x1` is malformed.
Keep it disabled for RPC quantities such as `0x0` or `0x400`, which are valid with an odd number of hex characters.

```ts
isHex('0x1', { even: true })
// false

isHex('0x01', { even: true })
// true

isHex('0x1', { even: false })
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