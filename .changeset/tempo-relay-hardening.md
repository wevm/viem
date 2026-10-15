---
"viem": patch
---

`viem/tempo`: Hardened `Relay` sponsorship by verifying raw senders from their signatures, rejecting non-canonical raw envelopes, preferring the sponsor's `feeToken` (now resolvable per chain), bounding fee-payer signatures with `validBefore` (`validity`), adding `onRejected` and `SponsoredEvent.feePayer`, fixing sponsored fills without `gas`, capping request bodies at 16 MiB, and requiring the full TIP-20 address prefix.
