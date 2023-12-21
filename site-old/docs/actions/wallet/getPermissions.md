---
head:
  - - meta
    - property: og:title
      content: getPermissions
  - - meta
    - name: description
      content: Gets the wallets current permissions.
  - - meta
    - property: og:description
      content: Gets the wallets current permissions.

---

# getPermissions

Gets the wallets current permissions.

## Usage

::: code-group

```ts [example.ts]
import { walletClient } from './client'
 
const permissions = await walletClient.getPermissions() // [!code focus:99]
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

[`wallet_getPermissions`](https://eips.ethereum.org/EIPS/eip-2255)

