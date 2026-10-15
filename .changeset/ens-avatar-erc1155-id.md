---
"viem": patch
---

Fixed `getEnsAvatar` substituting the `{id}` placeholder of ERC-1155 metadata URIs with the raw token ID instead of its lowercase, zero-padded hexadecimal form.
