---
"viem": patch
---

Fixed the `xdcTestnet` (XDC Apothem) `multicall3` address. The previous entry pointed to the canonical `0xca11…ca11`, which has no deployed code on Apothem (verified via `eth_getCode` on multiple RPCs), so `multicall` calls failed. Updated to a deployed Multicall3 at `0x7937b3878860eb3CDA14360cEaaa11a9646d941B`.
