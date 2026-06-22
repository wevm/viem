---
"viem": major
---

Removed the top-level `stringify` utility in favor of the `Json` module (re-exporting ox's `Json`, plus a `Json.prettyPrint` helper); `Json.stringify` tags `bigint` values so they round-trip via `Json.parse`, whereas the old `stringify` emitted a plain numeric string.

```diff
-import { stringify } from 'viem'
+import { Json } from 'viem'

-stringify({ value: 1n })
-// '{"value":"1"}'
+Json.stringify({ value: 1n })
+// '{"value":"1#__bigint"}'
```
