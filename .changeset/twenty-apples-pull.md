---
"viem": minor
---

Added entrypoints for chain utilities (`viem/chains/utils`) with exports for chain-specific chains, formatters, serializers, and types.

Examples:

```ts
import {
  type CeloBlock,
  type CeloTransaction,
  type OptimismBlock,
  type OptimismTransaction,
  serializeTransactionCelo,
} from 'viem/chains/utils'
```
