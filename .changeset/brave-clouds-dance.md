---
"viem": minor
---

- `viem/tempo` **(Breaking)**: Renamed `tempoTestnet` → `tempoModerato`. The old export is deprecated but still available as an alias.
- `viem/tempo` **(Breaking)**: Renamed `reward.start` → `reward.distribute`: Renamed for distributing rewards (no longer supports streaming).
- `viem/tempo` **(Breaking)**: Renamed `reward.getTotalPerSecond` → `reward.getGlobalRewardPerToken`: Returns the global reward per token value instead of per-second rate.
- `viem/tempo` **(Breaking)**: Renamed `reward.watchRewardScheduled` → `reward.watchRewardDistributed`: Watches for reward distributed events.
- `viem/tempo` **(Breaking)**: Removed `nonce.getNonceKeyCount`.
- `viem/tempo` **(Breaking)**: Removed `nonce.watchActiveKeyCountChanged`.
- `viem/tempo` **(Breaking)**: Removed `amm.watchFeeSwap` (FeeSwap event no longer emitted by protocol).
- `viem/tempo` **(Breaking)**: `OrderPlaced` event now includes `isFlipOrder` and `flipTick` fields. The `FlipOrderPlaced` event has been removed and merged into `OrderPlaced`.
- `viem/tempo` **(Breaking)**: Renamed `Address.stablecoinExchange` → `Address.stablecoinDex`.
- `viem/tempo` **(Breaking)**: Renamed `Abis.stablecoinExchange` → `Abis.stablecoinDex`.
- `viem/tempo`: Added `dex.cancelStale` action to cancel stale orders from restricted makers.
