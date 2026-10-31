---
"viem": patch
---

Fixed relay previews omitting every balance diff when a moved token is a plain ERC-20, such as a vault share, by reading its standard metadata.
