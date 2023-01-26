---
"viem": patch
---

- **Breaking**: Renamed `ethereumProvider` Transport to `custom`.
- **Breaking**: Refactored Transport APIs.
- **Breaking**: Flattened `sendTransaction`, `call` & `estimateGas` APIs.
- Added `encodeAbi` & `decodeAbi`.
- Added `fallback` Transport.
- Added `getFilterLogs`.