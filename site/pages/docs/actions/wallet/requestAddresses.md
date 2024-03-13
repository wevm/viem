---
description: Requests a list of accounts managed by a wallet.
---

# requestAddresses

Requests a list of accounts managed by a wallet.

`requestAddresses` sends a request to the wallet, asking for permission to access the user's accounts. After the user accepts the request, it will return a list of accounts (addresses).

This API can be useful for dapps that need to access the user's accounts in order to execute transactions or interact with smart contracts.

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './client'
 
const accounts = await walletClient.requestAddresses() // [!code focus:99]
// ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/walletClient.ts]
```

:::

## Returns

[`Address[]`](/docs/glossary/types#address)

## JSON-RPC Methods

[`eth_requestAccounts`](https://eips.ethereum.org/EIPS/eip-1102)