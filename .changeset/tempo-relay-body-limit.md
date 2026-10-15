---
"viem": patch
---

`viem/tempo`: Fixed `Relay` HTTP handlers buffering unbounded request bodies by refusing bodies over 16 MiB with `413` and a JSON-RPC error.
