---
"viem": major
---

- `viem/tempo` **(Breaking)**: Renamed `tempoTestnet` → `tempoModerato`. The old export is deprecated but still available as an alias.
- `viem/tempo` **(Breaking)**: Renamed `reward.start` → `reward.distribute`: Renamed for distributing rewards (no longer supports streaming).
- `viem/tempo` **(Breaking)**: Renamed `reward.getTotalPerSecond` → `reward.getGlobalRewardPerToken`: Returns the global reward per token value instead of per-second rate.
- `viem/tempo` **(Breaking)**: Renamed `reward.watchRewardScheduled` → `reward.watchRewardDistributed`: Watches for reward distributed events.
- `viem/tempo` **(Breaking)**: Removed `nonce.getNonceKeyCount`.
- `viem/tempo` **(Breaking)**: Removed `nonce.watchActiveKeyCountChanged`.
- `viem/tempo`: Added `dex.cancelStale` action to cancel stale orders from restricted makers.
