---
head:
  - - meta
    - property: og:title
      content: requestPermissions
  - - meta
    - name: description
      content: Requests permissions for a wallet.
  - - meta
    - property: og:description
      content: Requests permissions for a wallet.

---

# requestPermissions

Requests permissions for a wallet.

## Usage

::: code-group

```ts [example.ts]
import { walletClient } from './client'
 
const permissions = await walletClient.requestPermissions({ eth_accounts: {} }) // [!code focus:99]
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::

## Returns

[`WalletPermission[]`](/docs/glossary/types#walletpermission)

The wallet permissions.

## JSON-RPC Methods

[`wallet_requestPermissions`](https://eips.ethereum.org/EIPS/eip-2255)

