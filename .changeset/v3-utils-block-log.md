---
"viem": major
---

Block and log formatters moved from flat formatter exports to the `Block` and `Log` RPC conversion namespaces.

```diff
-import { formatBlock, formatLog } from 'viem'
+import { Block, Log } from 'viem'
 
-const block = formatBlock(rpcBlock)
-const log = formatLog(rpcLog)
+const block = Block.fromRpc(rpcBlock)
+const log = Log.fromRpc(rpcLog)
```

Block override, state override, and filter RPC conversions moved to the `BlockOverrides`, `StateOverrides`, and `Filter` namespaces.

```diff
-import type { BlockOverrides, Filter, StateOverride } from 'viem'
+import { BlockOverrides, Filter, StateOverrides } from 'viem'
 
-const blockOverrides: BlockOverrides = { baseFeePerGas: 1n }
-const stateOverride: StateOverride = [{ address, balance: 1n }]
-const filter: Filter = { fromBlock: 1n, toBlock: 2n }
+const rpcBlockOverrides = BlockOverrides.toRpc({ baseFeePerGas: 1n })
+const rpcStateOverrides = StateOverrides.toRpc([{ address, balance: 1n }])
+const rpcFilter = Filter.toRpc({ fromBlock: 1n, toBlock: 2n })
```
