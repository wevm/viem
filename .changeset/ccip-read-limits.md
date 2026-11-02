---
'viem': patch
---

Changed CCIP Read lookups to apply the Client transport timeout (the longest of a `fallback`'s transports) to gateway requests and to share one budget of 256 gateway requests (one per URL) and 16 concurrent requests across a lookup's callbacks and nested local batches.
