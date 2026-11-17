---
"viem": patch
---

Added TIP-1166 support to `viem/tempo` channels: the `SignerSnapshotCached` event and `SignerConfigChanged` and `SaltNotSignerCommitment` errors on the channel reserve ABI, `Actions.channel.getOpenSalt`, typed `ChannelSignerConfigChangedError` and `ChannelSaltNotSignerCommitmentError`, and a default `salt` for `Actions.channel.open` set to the voucher signer's configuration commitment when the signer is a configurable account or an access key of one.
