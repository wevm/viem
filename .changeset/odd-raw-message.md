---
"viem": patch
---

Fixed `toPrefixedMessage`, `hashMessage`, `signMessage`, `verifyMessage`, and `recoverMessageAddress` shifting the EIP-191 prefix when a `raw` hex message has an odd length.
