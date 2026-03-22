---
"viem": patch
---

Fixed incorrect `name` properties on five error classes. `InvalidAbiEncodingTypeError`, `InvalidAbiDecodingTypeError`, and `InvalidSerializedTransactionTypeError` were missing the `Error` suffix. `InvalidDomainError` and `InvalidPrimaryTypeError` were missing the `name` parameter entirely, falling back to `BaseError`.
