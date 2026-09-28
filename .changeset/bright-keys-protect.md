---
'viem': patch
---

Added `AesGcm` encryption and `MlDsa44` post-quantum signature utilities.

```ts
import { AesGcm, MlDsa44 } from 'viem/utils'

const keyPair = MlDsa44.createKeyPair()
const key = await AesGcm.getKey({ password: 'example' })
```
