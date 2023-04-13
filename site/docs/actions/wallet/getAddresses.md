---
head:
  - - meta
    - property: og:title
      content: getAddresses
  - - meta
    - name: description
      content: Returns a list of addresses owned by the wallet or client.
  - - meta
    - property: og:description
      content: Returns a list of addresses owned by the wallet or client.

---

# getAddresses

Returns a list of account addresses owned by the wallet or client.

## Usage

::: code-group

```ts [example.ts]
import { walletClient } from './client'
 
const accounts = await walletClient.getAddresses() // [!code focus:99]
// ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
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

[`Address[]`](/docs/glossary/types#address)

A list of checksummed addresses.


## JSON-RPC Methods

[`eth_accounts`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts)
