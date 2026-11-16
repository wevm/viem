---
"viem": patch
---

Queued batched requests in place and tracked a running batch size for split checks, so scheduling `n` requests in one batch no longer copies the queue `n` times.
