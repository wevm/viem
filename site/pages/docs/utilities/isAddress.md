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

:::info
The strict mode only work when the address is not in lowercase. When the address is in lowercase, it is only checked by the address regular expression.
:::

```ts
// lowercase address: 0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac
isAddress('0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac', { strict: true })
// true
isAddress('0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac', { strict: false })
// true

// checksum address: 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
isAddress('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', { strict: true })
// true

// invalid checksum address: 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678Ac
isAddress("0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678Ac", { strict: true })
// false
isAddress("0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678Ac", { strict: false })
// true

isAddress('lol', { strict: false })
// false
```
