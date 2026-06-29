---
"viem": minor
---

**Breaking (viem/tempo):** Changed Tempo token `.call` helpers to take the client before their action arguments.

```diff
-Actions.token.transfer.call({ token, to, amount })
+Actions.token.transfer.call(client, { token, to, amount })

-Actions.token.getBalance.call({ account, token })
+Actions.token.getBalance.call(client, { account, token })
```
