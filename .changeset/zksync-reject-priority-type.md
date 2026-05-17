---
"viem": patch
---

Fixed zkSync `sendTransaction` and `signTransaction` to reject the `priority` transaction type on the request path, which is not supported as a request type.
