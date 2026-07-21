---
"viem": patch
---

Added `tempoBlockNumber` to the return value of `zone.getZoneInfo`.

**Breaking (viem/tempo):** Replaced `zone.waitForDepositStatus` with `zone.waitForTempoBlock`, backed by the new zone info field, and removed `zone.getDepositStatus` with the underlying RPC method.
