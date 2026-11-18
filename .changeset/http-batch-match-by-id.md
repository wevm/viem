---
"viem": patch
---

Fixed `http` transport batches to match replies to requests by id (also when the server echoes a numeric id as a string), so a reply with `id: null` no longer gives other requests the wrong results.
