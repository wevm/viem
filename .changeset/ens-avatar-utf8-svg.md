---
"viem": patch
---

Fixed `getEnsAvatar` returning `null` for inline SVG avatars containing non-Latin-1 characters (e.g. `é` or emoji), and decoded base64 NFT metadata as UTF-8.
