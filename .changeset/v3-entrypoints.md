---
"viem": major
---

The `viem/accounts`, `viem/actions`, `viem/ens`, `viem/nonce`, and `viem/siwe` subpath entrypoints were removed in favor of namespaces exported from the package root.

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

The `viem/chains/utils` entrypoint was removed. Its members now live on the `Chain` namespace exported from the package root.

```diff
- import { defineChain, extractChain, getChainContractAddress } from 'viem/chains/utils'
+ import { Chain } from 'viem'

- export const example = defineChain({ /* ... */ })
+ export const example = Chain.from({ /* ... */ })

- const chain = extractChain({ chains, id: 10 })
+ const chain = Chain.extract({ chains, id: 10 })

- const address = getChainContractAddress({ chain, contract: 'multicall3' })
+ const address = Chain.getContractAddress({ chain, contract: 'multicall3' })
```

The `viem/celo`, `viem/linea`, `viem/op-stack`, and `viem/zksync` extension entrypoints were removed; their chain definitions remain in `viem/chains` as plain chains, while extension-specific actions, formatters, and serializers have no v3 equivalent (stay on v2, or use third-party packages built on `Chain.from` with `schema`/`serializers`/transaction hooks).

```diff
- import { optimism, publicActionsL2 } from 'viem/op-stack'
- import { zksync } from 'viem/zksync'
- import { celo } from 'viem/celo'
- import { linea } from 'viem/linea'
+ import { celo, linea, optimism, zksync } from 'viem/chains'
```

Added the `viem/zod` entrypoint, re-exporting the Zod namespace (`z`) used to build typed JSON-RPC schemas for the Client `schema` option.

```ts
import { z } from 'viem/zod'

const schema = z.RpcSchema.from({
  abe_foo: { params: z.tuple([z.number()]), returns: z.string() },
})
```

Added `signTransaction` to the `Actions` namespace and the `walletActions()` decorator as an alias of `Actions.transaction.sign`.
