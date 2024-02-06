---
description: Gets the wallets current permissions.
---

# getPermissions

Gets the wallets current permissions.

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './client'
 
const permissions = await walletClient.getPermissions() // [!code focus:99]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/walletClient.ts]
```

:::

## Returns

[`WalletPermission[]`](/docs/glossary/types#walletpermission)

The wallet permissions.

## JSON-RPC Methods

[`wallet_getPermissions`](https://eips.ethereum.org/EIPS/eip-2255)

