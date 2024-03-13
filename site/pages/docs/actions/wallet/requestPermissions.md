---
description: Requests permissions for a wallet.
---

# requestPermissions

Requests permissions for a wallet.

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './client'
 
const permissions = await walletClient.requestPermissions({ eth_accounts: {} }) // [!code focus:99]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/walletClient.ts]
```

:::

## Returns

[`WalletPermission[]`](/docs/glossary/types#walletpermission)

The wallet permissions.

## JSON-RPC Methods

[`wallet_requestPermissions`](https://eips.ethereum.org/EIPS/eip-2255)

