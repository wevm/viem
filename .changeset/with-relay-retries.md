---
"viem": patch
---

`viem/tempo`: Fixed `withRelay` and `withFeePayer` nesting the retries of their inner transports, which sent a failed request up to 16 times. The inner transports now send each attempt once, and the relay transport retries with the client's `retryCount`, as `fallback` does.
