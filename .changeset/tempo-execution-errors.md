---
"viem": minor
---

Added the Tempo `ExecutionError` module for decorating errors or revert data with decoded precompile details and readable messages.

```ts
import { ExecutionError } from 'viem/tempo'

const error = ExecutionError.from(new Error('execution reverted: failed'))
const rpc = ExecutionError.serialize(error)
```
