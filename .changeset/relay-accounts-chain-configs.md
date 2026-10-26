---
"viem": patch
---

`viem/tempo`: Fixed `Relay.accounts` serving a config stored for one chain through `account_getConfig` on another chain, by keying stored configs by chain ID (configs stored under the previous key are no longer read).
