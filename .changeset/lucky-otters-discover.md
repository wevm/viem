---
"viem": patch
---

Fixed `simulateCalls` throwing when `traceAssetChanges` is enabled and a call reverts against unmodified state, such as simulating a transfer the account cannot yet afford. Assets are now discovered from the `Transfer` logs of the simulated batch, so discovery also respects `stateOverrides` and the requested block.

Also fixed `simulateCalls` resolving `latest` separately for asset discovery and for measurement when no block was requested, which could compute the asset set against one block and the balances and results against another. The base block is now resolved once and both passes are pinned to it.
