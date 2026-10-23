---
"viem": patch
---

`viem/tempo`: Added experimental `Gateway` and `gatewayActions` (`client.ai`, `client.bucket`, `client.compute`, `client.kv`), with standalone `Actions.ai`, `Actions.bucket`, `Actions.compute`, and `Actions.kv`, for wallet-paid inference (including streamed text), object storage, metered and streamed CPU and GPU compute, and key-value state on a Tempo Gateway through an app-supplied payment-aware `fetch`.
