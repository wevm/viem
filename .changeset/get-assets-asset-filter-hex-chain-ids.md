---
"viem": patch
---

Fixed `getAssets` sending the `assets` filter to `wallet_getAssets` with decimal chain ID keys instead of hex chain IDs, and allowed `'native'` addresses in `WalletGetAssetsParameters['assetFilter']`.
