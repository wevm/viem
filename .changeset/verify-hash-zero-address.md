---
"viem": patch
---

Updated `Actions.verifyHash` and the actions built on it to return `false` for the zero address, and the deployless ERC-6492 validator to reject signatures whose ECDSA recovery yields the zero address.
