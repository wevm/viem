---
"viem": patch
---

Matched batched HTTP replies to their requests by id. A reply with a `null` id, which a JSON-RPC server sends for an item whose id it could not read, no longer moves the other replies onto the wrong requests.
