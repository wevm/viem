---
"viem": patch
---

Fixed batched `multicall`, `call`, and HTTP requests hanging with an unhandled rejection when the batch function threw synchronously, such as an extended `readContract` action.
