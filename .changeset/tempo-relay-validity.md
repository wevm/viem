---
"viem": patch
---

Added the `validity` option to `Relay.feePayer`, bounding returned fee-payer signatures by a generated `validBefore` on fills and requiring one within the window on `eth_signRawTransaction`.
