---
"viem": patch
---

`viem/tempo`: Removed admin access keys, which T14 (TIP-1137) retires: the `admin` option on key authorizations, `accessKey.isAdmin`, and `accessKey.watchAdminAuthorized`, so access keys no longer sign key authorizations.
