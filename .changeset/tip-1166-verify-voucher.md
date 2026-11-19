---
"viem": patch
---

`viem/tempo`: Renamed the `SignerSnapshotCached` event on `Abis.tip20ChannelReserve` to `OpeningCommitmentRecorded` to match the TIP-1166 precompile, which no longer emits the old event, and added `verifyVoucher` to the ABI with a `channel.verifyVoucher` action.
