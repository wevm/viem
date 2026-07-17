---
"viem": patch
---

Reduced ERC-4337 type-check cost (~10x for `viem/erc4337` consumers type-checking against source) by forwarding explicit type arguments between the user-operation actions instead of re-inferring the Bundler Client surface.
