---
"viem": patch
---

Tempo: emitted full broadcast envelope when relay co-signs during `eth_fillTransaction`, enabling single round-trip sponsorship. Stripped `feeToken` from the sender's sign payload under sponsorship per the Tempo Transaction spec.
