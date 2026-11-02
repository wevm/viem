---
"viem": patch
---

Fixed `Actions.ens.getAvatar` failing on inline SVGs and base64 NFT metadata with non-ASCII characters or line breaks, and substituting decimal ERC-1155 token IDs into `{id}` metadata URIs instead of 64-character hex.
