---
"viem": patch
---

Fixed request retries ignoring `Retry-After` headers in HTTP-date form, which retried immediately instead of waiting until the given date.
