---
"viem": patch
---

Fixed `parseSiweMessage` losing or truncating `resources` when `Resources:` appeared in the statement, URI, Request ID or a resource.
