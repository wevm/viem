---
"viem": patch
---

Fixed `shouldRetry` not retrying QuickNode's `-32007` rate-limit error code, mirroring the existing handling for the `429` (Alchemy) case.
