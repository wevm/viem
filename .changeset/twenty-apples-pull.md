---
"viem": minor
---

Added entrypoints for Celo (`viem/chains/celo`) & Optimism (`viem/chains/optimism`) chains with exports for their compatible chains, formatters, serializers, and types.

Examples:

```ts
import { 
  base, 
  optimism, 
  zora, 
  type OptimismBlock,
  type OptimismTransaction,
} from 'viem/chains/optimism'

import { 
  serializeTransactionCelo,
  type CeloBlock,
  type CeloTransaction,
} from 'viem/chains/celo'
```
