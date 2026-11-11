---
"viem": patch
---

Fixed `Actions.earn.deployErc4626StackSync` falling back to the client account when `account` was `null`, so it now throws `AccountNotFoundError` like the other Earn deployment actions.
