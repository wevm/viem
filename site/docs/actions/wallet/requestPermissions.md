# requestPermissions

Requests permissions for a wallet.

## Usage

```ts
import { requestPermissions } from 'viem'
```

## Usage

```ts
import { requestPermissions } from 'viem'
import { walletClient } from '.'
 
const permissions = await requestPermissions(walletClient, { eth_accounts: {} }) // [!code focus:99]
```

## Returns

[`WalletPermission[]`](/docs/glossary/types#TODO)

The wallet permissions.


