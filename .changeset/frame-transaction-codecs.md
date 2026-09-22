---
"viem": minor
---

Added EIP-8141 frame transaction types, serialization, and parsing.

```ts
import { serializeTransaction } from 'viem'

const serialized = serializeTransaction({
  chainId: 1,
  frames: [{ flags: 'approveExecutionAndPayment', gas: 50_000n, mode: 'verify' }],
  sender: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  signatures: [{ scheme: 'secp256k1' }],
})
```
