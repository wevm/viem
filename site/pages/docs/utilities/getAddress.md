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
