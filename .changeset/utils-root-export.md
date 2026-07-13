---
"viem": major
---

**Breaking:** Removed the root re-export of the utility namespaces; import them from `viem/utils` instead.

```diff
- import { Hex, Value } from 'viem'
+ import { Hex, Value } from 'viem/utils'
```
