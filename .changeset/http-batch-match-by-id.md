---
"viem": patch
---

Fixed `http` transport batches to match replies to requests by id, so a reply with `id: null` no longer gives other requests the wrong results.
