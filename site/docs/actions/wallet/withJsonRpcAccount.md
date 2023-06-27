---
head:
  - - meta
    - property: og:title
      content: withJsonRpcAccount
  - - meta
    - name: description
      content: Returns a Client with an attached JSON-RPC Account.
  - - meta
    - property: og:description
      content: Returns a Client with an attached JSON-RPC Account.

---

# withJsonRpcAccount

Returns a Client with an attached JSON-RPC Account asynchronously retrieved via `eth_accounts` or `eth_requestAccounts`.

## Usage

```ts {7}
import { createWalletClient, http } from 'viem'
import { mainnnet } from 'viem/chains'

const client = await createWalletClient({ 
  chain: mainnet,
  transport: http()
}).withJsonRpcAccount({ method: 'request' })
```

## Returns

Client with an attached `account` (JSON-RPC Account).

## Parameters

### method (optional)

- **Type:** `"get" | "request"`
- **Default:** `"get"`

RPC Method to retrieve the Accounts from the Wallet.

- `"get"`: `eth_accounts`
- `"request"`: `eth_requestAccounts`

### index (optional)

- **Type:** `number`
- **Default:** `0`

Index of the Account to use from the retrieved Accounts.
