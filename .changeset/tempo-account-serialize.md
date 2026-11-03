---
"viem": patch
---

Added `Account.serialize` and `Account.deserialize` to `viem/tempo`, which store a configurable account (TIP-1107) as JSON and rebuild it with passkey owners that sign, and `Account.AddressMismatchError` for a version-zero config that does not derive the stored address. Added a `keyAuthorization` option to access key accounts, which attaches a signed key authorization to the account's transactions until the chain registers the access key.
