---
"viem": patch
---

Set the documented `ProviderRpcError` name by default on `types.ProviderRpcError` (`EIP1193ProviderRpcError`) and `errors.ProviderRpcError`, so both agree with their exported `ProviderRpcErrorType` aliases while still honoring a caller-supplied or subclass `name`.
