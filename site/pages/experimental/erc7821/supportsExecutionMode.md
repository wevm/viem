---
description: Checks if the contract supports the ERC-7821 execution mode.
---

# supportsExecutionMode

Checks if the contract supports the [ERC-7821](https://eips.ethereum.org/EIPS/eip-7821) execution mode.

## Usage

:::code-group

```ts twoslash [example.ts]
import { client } from './config'
 
const supported = await client.supportsExecutionMode({ // [!code focus:99]
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7821Actions } from 'viem/experimental'

export const client = createClient({
  chain: mainnet,
  transport: http(),
}).extend(erc7821Actions())
```

:::

## Returns

`boolean`

If the contract supports the ERC-7821 execution mode.

## Parameters

### address

- **Type:** `Address`

The address of the contract to check.

### opData

- **Type:** `Hex`

Additional data to pass to execution.
