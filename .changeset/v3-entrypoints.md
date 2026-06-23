---
"viem": major
---

The `viem/accounts`, `viem/actions`, `viem/ens`, and `viem/siwe` subpath entrypoints were removed in favor of namespaces exported from the package root.

```diff
- import { privateKeyToAccount } from 'viem/accounts'
- import { getBalance } from 'viem/actions'
+ import { Account, Actions } from 'viem'

- const account = privateKeyToAccount('0x...')
- const balance = await getBalance(client, { address: account.address })
+ const account = Account.fromPrivateKey('0x...')
+ const balance = await Actions.address.getBalance(client, { address: account.address })
```

The `viem/utils` entrypoint now exposes Ox-backed namespaces instead of flat utility functions.

```diff
- import { toHex, parseEther } from 'viem/utils'
+ import { Hex, Value } from 'viem'

- const hex = toHex(420n)
- const wei = parseEther('1')
+ const hex = Hex.fromNumber(420n)
+ const wei = Value.fromEther('1')
```

Top-level types are now accessed through their namespace rather than as named type exports.

```diff
- import type { Chain, Account, Transport } from 'viem'
+ import { Chain, Account, Transport } from 'viem'

- function f(chain: Chain, account: Account, transport: Transport) {}
+ function f(chain: Chain.Chain, account: Account.Account, transport: Transport.Transport) {}
```

`defineChain` was removed from the `viem/chains/utils` entrypoint in favor of `Chain.from` from the package root.

```diff
- import { defineChain } from 'viem/chains/utils'
+ import { Chain } from 'viem'

- export const example = defineChain({ /* ... */ })
+ export const example = Chain.from({ /* ... */ })
```
