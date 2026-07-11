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

Added flattened entrypoints for root core modules such as `viem/Client`, `viem/Chain`, and `viem/Transport`.

```diff
+ import * as Account from 'viem/Account'
+ import * as Actions from 'viem/Actions'
+ import * as Chain from 'viem/Chain'
+ import * as Client from 'viem/Client'
+ import * as Contract from 'viem/Contract'
+ import * as Transport from 'viem/Transport'
```

`getContract` moved to `Contract.from`, binding one Client, renaming `getEvents` to `getLogs`, and accepting function arguments inside each method's options bag.

```diff
- import {
-   getContract,
-   type GetContractErrorType,
-   type GetContractParameters,
-   type GetContractReturnType,
- } from 'viem'
+ import { Contract } from 'viem'

- const contract = getContract({
-   abi,
-   address,
-   client: { public: publicClient, wallet: walletClient },
- })
- const balance = await contract.read.balanceOf([owner])
+ const contract = Contract.from({ abi, address, client })
+ const balance = await contract.read.balanceOf({ args: [owner] })

- const logs = await contract.getEvents.Transfer()
+ const logs = await contract.getLogs.Transfer()

- type Options = GetContractParameters<typeof abi, typeof client, typeof address>
- type Result = GetContractReturnType<typeof abi, typeof client, typeof address>
- type Error = GetContractErrorType
+ type Options = Contract.from.Options<typeof abi, typeof address, typeof client>
+ type Result = Contract.from.ReturnType<typeof abi, typeof address, typeof client>
+ type BoundContract = Contract.Contract<typeof abi, typeof address, typeof client>
+ // `GetContractErrorType` has no replacement; use each method's error union.
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

The `viem/package.json` export was removed.

```diff
- import packageJson from 'viem/package.json'
+ // `viem/package.json` is not exported.
```

The `viem/celo`, `viem/linea`, `viem/op-stack`, and `viem/zksync` extension entrypoints were removed; their chain definitions remain in `viem/chains` as plain chains, while extension-specific actions, formatters, and serializers have no v3 equivalent (stay on v2, or use third-party packages built on `Chain.from` with `schema`/`serializers`/transaction hooks).

```diff
- import { optimism, publicActionsL2 } from 'viem/op-stack'
- import { zksync } from 'viem/zksync'
- import { celo } from 'viem/celo'
- import { linea } from 'viem/linea'
+ import { celo, linea, optimism, zksync } from 'viem/chains'
```

The `viem/experimental` root and ERC subpaths were removed after surviving APIs graduated or moved behind smart-account implementations.

```diff
- import { erc7811Actions, erc7821Actions, erc7846Actions } from 'viem/experimental'
- import { getAssets } from 'viem/experimental/erc7811'
- import { execute } from 'viem/experimental/erc7821'
- import { connect } from 'viem/experimental/erc7846'
+ import { Actions, erc7821Actions, walletActions } from 'viem'

- client.extend(erc7811Actions()).extend(erc7846Actions())
+ client.extend(walletActions())
- await getAssets(client)
- await connect(client)
- await execute(client, options)
+ await Actions.wallet.getAssets(client)
+ await Actions.wallet.connect(client)
+ await Actions.erc7821.execute(client, options)
```

ERC-7715 `grantPermissions` and ERC-7895 `addSubAccount` were removed without v3 replacements.

```diff
- import { grantPermissions } from 'viem/experimental'
- import { addSubAccount } from 'viem/experimental/erc7895'

- await grantPermissions(client, options)
- await addSubAccount(client, options)
+ // No v3 equivalents.
```

Experimental authorization helpers moved to `Authorization`, with bigint nonces, hex-only signing payloads, and synchronous recovery and verification.

```diff
- import {
-   hashAuthorization,
-   recoverAuthorizationAddress,
-   serializeAuthorizationList,
-   verifyAuthorization,
- } from 'viem/experimental'
+ import { Authorization, Bytes } from 'viem'

- const payload = hashAuthorization({ contractAddress, chainId, nonce: 1, to: 'bytes' })
- const recovered = await recoverAuthorizationAddress({ authorization })
- const valid = await verifyAuthorization({ address, authorization })
- const tuples = serializeAuthorizationList(authorizationList)
+ const payload = Bytes.fromHex(
+   Authorization.getSignPayload({ address: contractAddress, chainId, nonce: 1n }),
+ )
+ const recovered = Authorization.recoverAddress({ authorization })
+ const valid = Authorization.verify({ address, authorization })
+ const tuples = Authorization.toTupleList(authorizationList)
```

Added the `viem/zod` entrypoint, re-exporting the Zod namespace (`z`) used to build typed JSON-RPC schemas for the Client `schema` option.

```diff
+ import { z } from 'viem/zod'

+ const schema = z.RpcSchema.from({
+   abe_foo: { params: z.tuple([z.number()]), returns: z.string() },
+ })
```

Added `signTransaction` to the `Actions` namespace and the `walletActions()` decorator as an alias of `Actions.transaction.sign`.

```diff
+ import { Actions, walletActions } from 'viem'

+ const signature = await Actions.signTransaction(client, options)
+ const wallet = client.extend(walletActions())
```
