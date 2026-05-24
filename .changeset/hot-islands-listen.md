---
"viem": patch
---

Emitted a full broadcast envelope when the fee payer co-signed during `eth_fillTransaction`, enabling single round-trip sponsorship, and stripped `feeToken` from the sender's sign payload under sponsorship per the Tempo Transaction spec.
