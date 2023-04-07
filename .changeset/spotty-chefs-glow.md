---
"viem": patch
---

Fixed an issue where filtered logs that do not conform to the provided ABI would cause `getLogs`, `getFilterLogs` or `getFilterChanges` to throw – these logs are now skipped. See [#323](https://github.com/wagmi-dev/viem/issues/323#issuecomment-1499654052) for more info.
