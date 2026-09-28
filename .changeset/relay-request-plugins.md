---
"viem": minor
---

Added Fetch-based relay plugins and signature-specific execution errors, replacing `Multisig.handleRequest`, `withMultisig`, and the `experimental_multisig` client option.

```ts
const plugins = [
  Relay.multisig({ store }),
  Relay.simulate({ store }),
  Relay.feePayer({ account }),
  Relay.autoSwap({ store }),
  Relay.feeToken({ store }),
]

const relay = Relay.create({ client, plugins })
const transport = withRelay(http(), { plugins })
```
