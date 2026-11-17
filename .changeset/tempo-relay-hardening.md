---
"viem": patch
---

`viem/tempo`: Hardened `Relay.feePayer` sponsorship by recovering raw senders from their signatures, rejecting non-canonical envelopes, bounding returned signatures by `validity`, accepting a per-chain `feeToken` resolver, adding `minimumBaseFee` and `onRejected` for base-fee rejections, adding `feePayer` to `SponsoredEvent`, estimating sponsored fills without the sender's fee caps, and capping Relay request bodies at 16 MiB.
