---
"viem": patch
---

Fixed the `http` transport `timeout` not applying while the response body is read, or when the request is given an abort `signal`.
