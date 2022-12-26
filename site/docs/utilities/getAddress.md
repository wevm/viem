# getAddress

Converts an address to an address that is [checksum encoded](/TODO).

## Import

```ts
import { getAddress } from 'viem'
```

## Usage

```ts
import { getAddress } from 'viem'

getAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac') // [!code focus:2]
// '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'
```

## Returns

`string`

The checksummed address.

## Arguments

### address

- **Type:** `Address`

An Ethereum address.