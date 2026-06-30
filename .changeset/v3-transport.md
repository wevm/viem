---
"viem": major
---

The HTTP transport now caps RPC response bodies at 10 MB by default (configurable via `maxResponseBodySize`, or `false` to disable), throwing `RpcClient.ResponseBodyTooLargeError` when exceeded.

```diff
  import { http } from 'viem'

- const transport = http('https://example.com')
+ const transport = http('https://example.com', { maxResponseBodySize: 20_971_520 })
```

Transport instances now expose `setup(...)` instead of being called as functions.

```diff
  import { http } from 'viem'

- const transport = http('https://example.com')({})
+ const transport = http('https://example.com').setup({})
```

WebSocket and IPC subscriptions now register data handlers on the returned subscription instead of accepting `onData` in the subscribe call.

```diff
  import { webSocket } from 'viem'

  const transport = webSocket('wss://example.com').setup()
- const subscription = await transport.subscribe({
-   params: ['newHeads'],
-   onData: (data) => console.log(data),
- })
+ const subscription = await transport.subscribe({ params: ['newHeads'] })
+ subscription.onData((data) => console.log(data))
```

The deprecated WebSocket transport `getSocket` helper was removed in favor of `getRpcClient`.

```diff
  import { webSocket } from 'viem'

  const transport = webSocket('wss://example.com').setup()
- const socket = await transport.getSocket()
+ const rpcClient = await transport.getRpcClient()
```

The HTTP transport-level typed `rpcSchema` option was removed, with request typing supplied by the client `schema` option instead.

```diff
- import { createClient, http, rpcSchema } from 'viem'
+ import { Client, http } from 'viem'
+ import * as RpcSchema from 'ox/RpcSchema'

- const transport = http('https://example.com', {
-   rpcSchema: rpcSchema<[{ Method: 'eth_chainId'; ReturnType: '0x1' }]>(),
- })
- const client = createClient({ transport })
+ const client = Client.create({
+   schema: RpcSchema.from<{
+     Request: { method: 'eth_chainId' }
+     ReturnType: '0x1'
+   }>(),
+   transport: http('https://example.com'),
+ })
```
