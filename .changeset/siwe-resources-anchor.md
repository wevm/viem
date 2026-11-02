---
"viem": patch
---

Fixed `Siwe.parseMessage` losing or truncating `resources` when `Resources:` appeared in the statement, URI, Request ID or a resource.
