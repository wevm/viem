---
"viem": minor
---

Added `TempoExecutionError` and access key error classes to Tempo actions, with decoded precompile errors, fetched limit and expiry details, and resolution hints.

```ts
import { AccessKeySpendingLimitExceededError } from 'viem/tempo'

try {
  await client.token.transfer({ account: accessKey, amount, to, token })
} catch (error) {
  if (error instanceof AccessKeySpendingLimitExceededError)
    console.log(error.amount, error.remaining, error.periodEnd, error.hints)
}
```
