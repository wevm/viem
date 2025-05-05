---
description: Requests to connect account(s).
---

# connect

Requests to connect account(s) with optional [capabilities](#capabilities).

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
 
const { accounts } = await walletClient.connect() // [!code focus]
```

```ts twoslash [config.ts] filename="config.ts"
import 'viem/window'
// ---cut---
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7846Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
}).extend(erc7846Actions())
```

:::

## Capabilities

### `unstable_addSubAccount`

### `unstable_getSubAccounts`

### `unstable_signInWithEthereum`

## Returns

## Parameters

