---
description: Converts an address into an address that is checksum encoded.
---

# getAddress

Converts an address into an address that is [checksum encoded](https://eips.ethereum.org/EIPS/eip-55). Supports [EIP-1191](https://eips.ethereum.org/EIPS/eip-1191).

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

The input's casing is ignored, so an address with a wrong checksum is returned with the correct one. It throws only if the string is not 20 bytes of hex. To reject a wrong checksum, check the input with [`isAddress`](/docs/utilities/isAddress) first.

```ts
import { getAddress, isAddress } from 'viem'

const input = '0x787bc77F1700DCE0f8c1581c18A12d3153D1b150' // last `B` lowercased

getAddress(input)
// '0x787bc77F1700DCE0f8c1581c18A12d3153D1B150'

isAddress(input)
// false
```

## Returns

[`Address`](/docs/glossary/types#address)

The checksummed address.

## Parameters

### address

- **Type:** `string`

An Ethereum address.

### chainId (optional)

- **Type:** `number`

The chain ID of the network the address is on. Complies to [EIP-1191](https://eips.ethereum.org/EIPS/eip-1191).

:::warning[Warning]
EIP-1191 checksum addresses are generally not backwards compatible with 
the wider Ethereum ecosystem, meaning it will break when validated against 
an application/tool that relies on EIP-55 checksum encoding (checksum without chainId).

It is highly recommended to not use this feature unless you know what you are doing.

See more: https://github.com/ethereum/EIPs/issues/1121
:::
