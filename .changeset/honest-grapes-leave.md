---
"viem": minor
---

Renamed the `OnLogParameter` and `OnLogFn` types with the appropriate file prefixes.

- `watchEvent.ts`
  - Renamed to `WatchEventOnLogParameter` and `WatchEventOnLogFn`.
  - Deprecated the `OnLogParameter` and `OnLogFn` exports.
- `watchContractEvent.ts`
  - Renamed to `WatchContractEventOnLogParameter` and `WatchContractEventOnLogFn`.
  - Exported both types.
