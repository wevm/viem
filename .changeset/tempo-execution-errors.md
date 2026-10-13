---
"viem": minor
---

Added typed `TempoExecutionError` errors to Tempo actions, with per-module subclasses carrying decoded arguments, fetched onchain details, and resolution hints.

```ts
import { Actions } from 'viem/tempo'

try {
  await Actions.token.transferSync(client, { amount, to, token })
} catch (e) {
  const error = e as Actions.token.transferSync.ErrorType
  if (error.name === 'AccessKeySpendingLimitExceededError')
    console.log(error.remaining, error.periodEnd, error.hints)
}
```
