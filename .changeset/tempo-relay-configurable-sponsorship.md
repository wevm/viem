---
"viem": patch
---

`viem/tempo`: Fixed `Relay.feePayer` co-signing the fill of a configurable account transaction instead of deferring sponsorship to broadcast, and `withRelay` sending fee-payer-format configurable account transactions to `eth_signRawTransaction` instead of the relay.
