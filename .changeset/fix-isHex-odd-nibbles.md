---
"viem": patch
---

`isHex` in strict mode now rejects hex strings with an odd number of nibbles (e.g. `"0x1"`, `"0xabc"`). The EVM and all Ethereum tooling work exclusively with full bytes; an odd-nibble hex string is always malformed. Non-strict mode behaviour is unchanged.
