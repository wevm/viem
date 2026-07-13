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
+ import { RpcSchema } from 'viem/utils'

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

The public `withCache`, `withRetry`, `withTimeout`, and `fallback.shouldThrow` helpers were internalized without replacements, along with the `socketClientCache` map (cached socket clients evict themselves on `close()`).

```diff
- import { withCache, withRetry, withTimeout } from 'viem'
+ // Compose caching, retries, and timeouts around your transport or client.
```

Custom transports are authored with `Transport.from` instead of `createTransport`, and the transport types moved onto the `Transport` namespace and the factory namespaces. `HttpTransport`-style instance types become `Transport.Transport<type>` parameterized by the transport type, `*TransportConfig` option bags become each factory's `Options`, and the single `TransportConfig` bag (formerly at `transport({}).config`) was split between the transport identity and the live `setup()` instance — `GetTransportConfig` is expressible as `ReturnType<transport['setup']>`.

```diff
- import { createTransport, type CustomTransport, type FallbackTransport, type HttpTransport, type HttpTransportConfig } from 'viem'
+ import { Transport, custom, fallback, http, webSocket } from 'viem'

- const transport: HttpTransport = createTransport({ key, name, request, type: 'http' })
+ const transport: Transport.Transport<'http'> = Transport.from({ key, name, type: 'http', setup })

- type Config = HttpTransportConfig
+ type Config = http.Options
- type WsConfig = WebSocketTransportConfig
+ type WsConfig = webSocket.Options
- type CustomConfig = CustomTransportConfig
+ type CustomConfig = custom.Options
- type FallbackConfig = FallbackTransportConfig
+ type FallbackConfig = fallback.Options
```

The low-level RPC client helpers keep their `RpcClient` namespace home (`getHttpRpcClient` → `RpcClient.http`, `getWebSocketRpcClient`/`getSocketRpcClient` → `RpcClient.webSocket`), with clients typed as `RpcClient.RpcClient` (the WebSocket transport's live client is `WebSocketRpcClient` from the `webSocket` factory), and the deprecated callback-based `WebSocketOptions`/`WebSocketAsyncOptions` shapes removed.
