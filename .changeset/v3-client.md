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

The typed RPC schema option was renamed from `rpcSchema` to `schema` and now accepts an Ox RPC schema value.

```diff
- import { createClient, http, rpcSchema } from 'viem'
+ import { Client, http } from 'viem'
+ import * as RpcSchema from 'ox/RpcSchema'

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
