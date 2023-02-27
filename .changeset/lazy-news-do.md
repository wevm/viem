---
"viem": patch
---

**Breaking:** Renamed `encodeAbi` & `decodeAbi` to `encodeAbiParameters` & `decodeAbiParameters`, and modified API from named arguments to inplace arguments:

```diff
import {
- encodeAbi,
- decodeAbi,
+ encodeAbiParameters,
+ decodeAbiParameters,
} from 'viem'

-const result = encodeAbi({ params, values })
+const result = encodeAbiParameters(params, values)

-const result = decodeAbi({ params, data })
+const result = decodeAbiParameters(params, data)
```