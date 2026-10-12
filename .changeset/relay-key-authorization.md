---
"viem": patch
---

`viem/tempo`: Added the `Relay.keyAuthorization` plugin to `viem/tempo`, which saves key authorizations signed with `Actions.accessKey.signAuthorization` (including configurable account authorizations at quorum) and attaches them to the access key's next transaction, and added `Actions.accessKey.saveAuthorization` for authorizations signed elsewhere.
