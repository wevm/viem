---
"viem": minor
---

Added Fetch-based relays with fee-payer, auto-swap, fee-token, simulation, and multisig plugins, replacing `Multisig.handleRequest`, `withMultisig`, and the `experimental_multisig` client option.

```ts
const plugins = [
  Relay.feePayer({ account }),
  Relay.autoSwap(),
  Relay.feeToken(),
  Relay.simulate(),
  Relay.multisig({ store }),
]

const relay = Relay.create({ client, plugins })
const transport = withRelay(http(), { plugins })
```
