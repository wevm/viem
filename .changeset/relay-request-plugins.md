---
"viem": minor
---

Added Fetch-based relays with fee-payer, auto-swap, fee-token, simulation, and multisig plugins, replacing `Multisig.handleRequest`, `withMultisig`, and the `experimental_multisig` client option.

```ts
const plugins = [
  Relay.multisig({ store }),
  Relay.simulate(),
  Relay.feePayer({ account }),
  Relay.autoSwap(),
  Relay.feeToken(),
]

const relay = Relay.create({ client, plugins })
const transport = withRelay(http(), { plugins })
```
