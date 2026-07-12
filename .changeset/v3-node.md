---
"viem": major
---

The `mainnetTrustedSetupPath` export from `viem/node` was replaced by the re-exported Ox `trusted-setups` `Paths`.

```diff
- import { mainnetTrustedSetupPath } from 'viem/node'
+ import { Paths } from 'viem/node'

- const path = mainnetTrustedSetupPath
+ const path = Paths.mainnet
```

The `getIpcRpcClient` helper was removed from `viem/node`; obtain the RPC client from the `ipc` transport instead.

```diff
- import { getIpcRpcClient } from 'viem/node'
+ import { ipc } from 'viem/node'

- const rpcClient = await getIpcRpcClient({ path: '/tmp/geth.ipc' })
+ const transport = ipc('/tmp/geth.ipc')
+ const rpcClient = await transport.setup({}).getRpcClient()
```

The IPC transport types were renamed: `IpcTransport` is now `Ipc` and `IpcTransportConfig` is now `ipc.Options`.

```diff
- import { ipc, type IpcTransport, type IpcTransportConfig } from 'viem/node'
+ import { ipc, type Ipc } from 'viem/node'

- const transport: IpcTransport = ipc('/tmp/geth.ipc')
+ const transport: Ipc = ipc('/tmp/geth.ipc')
```

The aggregate `IpcTransportErrorType` alias was removed in favor of concrete transport, RPC response, and socket errors.

```diff
-import type { IpcTransportErrorType } from 'viem/node'
+import { RpcClient, RpcError, Transport } from 'viem'
```
