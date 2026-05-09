---
description: Checks if the address is valid.
---

# isAddress

Checks if the address is valid. By default, it also verifies whether the address is in checksum format.

## Import

```ts
import { isAddress } from 'viem'
```

## Usage

```ts
import { isAddress } from 'viem'

isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC') // [!code focus:2]
// true
```

## Returns

`boolean`

Whether or not the address is valid.

## Parameters

### address

- **Type:** `string`

An Ethereum address.

### options.strict (optional)

- **Type:** `boolean`
- **Default:** `true`

Enables strict mode. If enabled, it also verifies whether the address is in checksum format.

```ts
isAddress('0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac', { strict: false })
// true

isAddress('0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac', { strict: true })
// false

isAddress('lol', { strict: false })
// false
```
