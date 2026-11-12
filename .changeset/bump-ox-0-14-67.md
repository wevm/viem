---
"viem": patch
---

Updated `ox` to `0.14.67`, which parses Tempo WebAuthn signatures in linear time and refuses those above 2048 bytes, refuses a keychain signature nested in a keychain signature, a key authorization scope with `recipients` and no `selector`, a compressed public key where a Tempo address is derived, and a Tempo transaction with a `validBefore` or `validAfter` that is not a non-negative safe integer number, a `chainId` that is not a positive safe integer, or a fee payer signature `yParity` other than `0` or `1`, hashes the payload in `Secp256k1.verify` of `viem/tempo` when `hash: true` is used with `address`, and refuses call `data` with an odd number of hex digits in `viem/experimental/erc7821`.
