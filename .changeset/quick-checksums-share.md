---
"viem": patch
---

Cached `checksumAddress` results by the lowercase address, so differently cased inputs no longer recompute the hash, and skipped the `isAddress` cache for checks that do not need a checksum.
