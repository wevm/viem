# requestAccounts

Requests a list of accounts managed by a wallet.

`requestAccounts` sends a request to the wallet, asking for permission to access the user's accounts. After the user accepts the request, it will return a list of accounts (addresses).

This API can be useful for dapps that need to access the user's accounts in order to execute transactions or interact with smart contracts.

## Usage

```ts
import { walletClient } from '.'
 
const accounts = await walletClient.requestAccounts() // [!code focus:99]
// ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
```

## Returns

`'0x${string}'[]`

