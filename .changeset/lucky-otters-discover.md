---
"viem": patch
---

Fixed `simulateCalls` throwing when `traceAssetChanges` is enabled and a call reverts against unmodified state, such as simulating a transfer the account cannot yet afford. Assets are now discovered from the `Transfer` logs of the simulated batch, so discovery also respects `stateOverrides` and the requested block.
