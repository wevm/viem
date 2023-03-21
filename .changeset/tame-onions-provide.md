---
"viem": minor
---

**Breaking:** The following functions are now `async` functions instead of synchronous functions:

- `recoverAddress`
- `recoverMessageAddress`
- `verifyMessage`

```diff
import { recoverMessageAddress } from 'viem'

- recoverMessageAddress({ message: 'hello world', signature: '0x...' })
+ await recoverMessageAddress({ message: 'hello world', signature: '0x...' })
```
