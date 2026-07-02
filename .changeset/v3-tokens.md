---
"viem": major
---

ERC-20 token actions were grouped under the `token` namespace on the root `Actions` namespace and on the public/wallet decorators.

```diff
- import { token } from 'viem/actions'
+ import { Actions } from 'viem'

- const balance = await token.getBalance(client, { account, token: address })
+ const balance = await Actions.token.getBalance(client, { account, token: address })

- const balance = await client.token.getBalance({ account, token: address })
+ const balance = await client.token.getBalance({ account, token: address })
```

Token construction moved from `defineToken` (exported from `viem/tokens`) to `Token.from` (exported from `viem`).

```diff
- import { defineToken } from 'viem/tokens'
+ import { Token } from 'viem'

- const usdc = defineToken({ addresses, currency: 'USD', decimals: 6, name: 'USD Coin', symbol: 'USDC' })
+ const usdc = Token.from({ addresses, currency: 'USD', decimals: 6, name: 'USD Coin', symbol: 'USDC' })
```
