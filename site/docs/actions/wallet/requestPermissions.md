# requestPermissions

Requests permissions for a wallet.

## Usage

```ts
import { requestPermissions } from 'viem/wallet'
```

## Usage

```ts
import { requestPermissions } from 'viem/wallet'
import { walletClient } from '.'
 
const permissions = await requestPermissions(walletClient, { eth_accounts: {} }) // [!code focus:99]
```

## Returns

[`WalletPermission[]`](/docs/glossary/types#TODO)

The wallet permissions.


