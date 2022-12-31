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

[`WalletPermission[]`](/TODO)

The wallet permissions.

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/TODO"></iframe>

