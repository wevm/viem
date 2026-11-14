---
description: Checks if the address is valid.
---

# isAddress

Checks if the address is valid. By default, it also verifies the [EIP-55](https://eips.ethereum.org/EIPS/eip-55) checksum of mixed-case addresses.

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

## Checksums

An address is 20 bytes of hex, which is case-insensitive. [EIP-55](https://eips.ethereum.org/EIPS/eip-55) uses the letter casing as a checksum: each letter is uppercase or lowercase according to the keccak256 hash of the lowercase address. Changing the case of a single letter breaks the checksum.

```ts
// Correct checksum
isAddress('0x787bc77F1700DCE0f8c1581c18A12d3153D1B150')
// true

// Last `B` lowercased, so the checksum does not match
isAddress('0x787bc77F1700DCE0f8c1581c18A12d3153D1b150')
// false

// All lowercase has no checksum to verify
isAddress('0x787bc77f1700dce0f8c1581c18a12d3153d1b150')
// true
```

An all-uppercase address is treated as a mixed-case address and fails the checksum in strict mode.

To validate user input, use `isAddress`. [`getAddress`](/docs/utilities/getAddress) does not validate the checksum: it returns the checksummed form of any casing.

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

Enables strict mode. If enabled, mixed-case addresses must match their checksum. If disabled, only the length and hex characters are checked.

```ts
isAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac', { strict: false })
// true

isAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac', { strict: true })
// false

isAddress('lol', { strict: false })
// false
```
