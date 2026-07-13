---
"viem": major
---

Client factory entrypoints were consolidated into `Client.create`, with public and test actions added via `.extend(...)` decorators.

```diff
- import { createPublicClient, http } from 'viem'
+ import { Client, http, publicActions } from 'viem'
  import { mainnet } from 'viem/chains'

- const client = createPublicClient({
+ const client = Client.create({
    chain: mainnet,
    transport: http(),
- })
+ }).extend(publicActions())
```

Test client mode was moved from `createTestClient` onto `testActions`, which now defaults to Anvil mode when omitted.

```diff
- import { createTestClient, http } from 'viem'
+ import { Client, http, testActions } from 'viem'
  import { mainnet } from 'viem/chains'

- const client = createTestClient({
-   mode: 'anvil',
+ const client = Client.create({
    chain: mainnet,
    transport: http(),
- })
+ }).extend(testActions({ mode: 'anvil' }))
```

Wallet clients were folded into base client creation, with the default account passed directly to `Client.create`.

```diff
- import { createWalletClient, http } from 'viem'
+ import { Client, http } from 'viem'
  import { mainnet } from 'viem/chains'
  import { privateKeyToAccount } from 'viem/accounts'

- const client = createWalletClient({
+ const client = Client.create({
    account: privateKeyToAccount('0x...'),
    chain: mainnet,
    transport: http(),
  })
```

The experimental block tag option was renamed to `blockTag`.

```diff
- import { createClient, http } from 'viem'
+ import { Client, http } from 'viem'
  import { mainnet } from 'viem/chains'

- const client = createClient({
+ const client = Client.create({
    chain: mainnet,
-   experimental_blockTag: 'pending',
+   blockTag: 'pending',
    transport: http(),
  })
```

The typed RPC schema option was renamed from `rpcSchema` to `schema` and now accepts an `RpcSchema` value (re-exported from `viem/utils`). The `RpcSchemaOverride` per-request override type was removed with it — type custom methods by passing a schema to `Client.create` (untyped methods remain callable).

```diff
- import { createClient, http, rpcSchema } from 'viem'
+ import { Client, http } from 'viem'
+ import { RpcSchema } from 'viem/utils'

- const client = createClient({
-   rpcSchema: rpcSchema<[{ Method: 'eth_chainId'; ReturnType: '0x1' }]>(),
+ const client = Client.create({
+   schema: RpcSchema.from<{
+     Request: { method: 'eth_chainId' }
+     ReturnType: '0x1'
+   }>(),
   transport: http('https://example.com'),
 })
```

The named client and decorator-bag types were replaced by `Client.Client`: `PublicClient`, `WalletClient`, and `TestClient` have no named equivalents — every generic defaults to its widest form, so a bare `Client.Client` accepts any client — and `PublicActions`/`WalletActions`/`TestActions` became each decorator's `Decorator` namespace type. When parameterizing, note the generic order is `<chain, account, transport, tokens, schema, extended>` (v2 `Client` was `<transport, chain, account, rpcSchema, extended>`); constrain `extended` (e.g. `publicActions.Decorator`) only when calling decorated methods on the client.

```diff
- import type { PublicActions, PublicClient, TestClient, WalletClient } from 'viem'
+ import type { Client, publicActions, testActions } from 'viem'

- function takesClient(client: PublicClient) {}
+ function takesClient(client: Client.Client) {}

- type Actions = PublicActions
+ type Actions = publicActions.Decorator
- type Mode = TestClientMode
+ type Mode = testActions.Options['mode']
```

`ClientConfig` moved to `Client.create.Options`, and the client-level multicall batch type moved from `MulticallBatchOptions` to `Client.MulticallOptions` (adding `deployless`). The transport-aware `GetPollOptions` helper was removed — watch actions accept a plain `poll?: boolean` and pick subscriptions automatically when the transport supports them.
