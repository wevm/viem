---
"viem": patch
---

Fixed `validateTypedData` (and so `hashTypedData` and `signTypedData`) rejecting struct names that contain `:`, such as `HyperliquidTransaction:SendAsset`.
