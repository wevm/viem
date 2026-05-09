---
description: Checks if the given addresses (checksummed) are equal.
---

# isAddressEqual

Checks if the given addresses (checksummed) are equal.

## Import

```ts
import { isAddressEqual } from 'viem'
```

## Usage

```ts
import { isAddressEqual } from 'viem'

isAddressEqual('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac', '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC') // [!code focus:2]
// true
```

## Returns

`boolean`

Whether or not the addresses are equal.
