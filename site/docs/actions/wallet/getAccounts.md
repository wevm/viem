# getAccounts

Returns a list of addresses owned by the wallet or client.

## Usage

```ts
import { getAccounts } from 'viem'
```

## Usage

```ts
import { getAccounts } from 'viem'
import { walletClient } from '.'
 
const accounts = await getAccounts(walletClient) // [!code focus:99]
// ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
```

## Returns

`'0x${string}'[]`

A list of checksummed addresses.

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/TODO"></iframe>

