---
"viem": minor
---

**Tempo:** Added `createClient` to `viem/tempo`: a Tempo-aware Client factory that defaults to the Tempo mainnet chain and an `http` transport, decorated with `publicActions`, `walletActions`, and `tempoActions`. Pass `testnet: true` to target the Tempo testnet, `chain` to override the chain, `transport` to override the transport, and `feeToken` to set a default fee token. Also re-exported the standard `http`, `custom`, `fallback`, and `webSocket` transports from `viem/tempo`.
