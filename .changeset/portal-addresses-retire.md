---
"viem": patch
---

**Breaking(`viem/tempo`)**: Replaced `portalAddresses` with `Addresses.portal`.

```ts
import { Addresses } from 'viem/tempo/zones'

const portal = Addresses.portal[42431][1]
```
