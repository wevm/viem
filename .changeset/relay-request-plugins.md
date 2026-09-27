---
"viem": minor
---

Added Fetch-based relays and multisig plugins, replacing `Multisig.handleRequest`, `withMultisig`, and the `experimental_multisig` client option.

```ts
const relay = Relay.create({
  client,
  plugins: [Relay.multisig({ store })],
})

const transport = withRelay(http(), {
  plugins: [Relay.multisig({ store })],
})
```
