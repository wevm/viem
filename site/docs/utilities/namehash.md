# namehash

Hashes ENS name.

## Import

```ts
import { namehash } from 'viem/ens'
```

## Usage

```ts
import { namehash } from 'viem/ens'

namehash('wagmi-dev.eth') // [!code focus:2]
// '0xf246651c1b9a6b141d19c2604e9a58f567973833990f830d882534a747801359'
```

## Returns

`string`

The hashed ENS name.

## Parameters

### name

- **Type:** `string`

A ENS name.