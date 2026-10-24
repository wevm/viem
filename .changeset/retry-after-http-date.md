---
"viem": patch
---

Fixed request retries firing immediately for `Retry-After` headers in HTTP-date form or for delays longer than the 24.8-day timer limit.
