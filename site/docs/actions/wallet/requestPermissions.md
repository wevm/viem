# requestPermissions

Requests permissions for a wallet.

## Usage

```ts
import { walletClient } from '.'
 
const permissions = await walletClient.requestPermissions({ eth_accounts: {} }) // [!code focus:99]
```

## Returns

[`WalletPermission[]`](/docs/glossary/types#TODO)

The wallet permissions.


