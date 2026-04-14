---
"viem": minor
---

Added `withRelay` to `viem/tempo` as the primary relay transport, and deprecated `withFeePayer` in favor of it.

**Relay transport**

- Added `withRelay(defaultTransport, relayTransport, parameters?)` to `viem/tempo`.
- `eth_fillTransaction` requests sent through `withRelay` are now forwarded to the relay transport.
- The `feePayer` value on `eth_fillTransaction` requests is preserved as provided, including `true`, explicit addresses, and omitted or nullish values.

**Compatibility**

- Deprecated `withFeePayer` in favor of `withRelay`.
- Existing `feePayer: true` sponsored transaction flows continue to work when sending Tempo transactions through the relay.
