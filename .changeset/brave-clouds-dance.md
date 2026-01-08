---
"viem": minor
---

### `viem/tempo` Extension

Added support for Tempo Moderato testnet.

- **(Breaking)**: Renamed `tempoTestnet` → `tempoModerato`. The old export is deprecated but still available as an alias.
- **(Breaking)**: Renamed `reward.start` → `reward.distribute`: Renamed for distributing rewards (no longer supports streaming).
- **(Breaking)**: Renamed `reward.getTotalPerSecond` → `reward.getGlobalRewardPerToken`: Returns the global reward per token value instead of per-second rate.
- **(Breaking)**: Renamed `reward.watchRewardScheduled` → `reward.watchRewardDistributed`: Watches for reward distributed events.
- **(Breaking)**: Removed `nonce.getNonceKeyCount`.
- **(Breaking)**: Removed `nonce.watchActiveKeyCountChanged`.
- **(Breaking)**: Removed `amm.watchFeeSwap` (FeeSwap event no longer emitted by protocol).
- **(Breaking)**: `OrderPlaced` event now includes `isFlipOrder` and `flipTick` fields. The `FlipOrderPlaced` event has been removed and merged into `OrderPlaced`.
- **(Breaking)**: Renamed `Address.stablecoinExchange` → `Address.stablecoinDex`.
- **(Breaking)**: Renamed `Abis.stablecoinExchange` → `Abis.stablecoinDex`.
- Added `dex.cancelStale` action to cancel stale orders from restricted makers.
- Added `salt` parameter to `token.create`.