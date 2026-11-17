---
'viem': patch
---

Fixed requests with an aborted `signal` staying pending on transports that ignore the signal.
