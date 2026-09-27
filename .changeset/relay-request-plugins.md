---
"viem": minor
---

Added Fetch-based relays and multisig plugins, replacing experimental `Multisig.handleRequest` and `withMultisig` APIs.

```ts
const relay = Relay.create({
  client,
  plugins: [Relay.multisig({ store })],
})

const transport = withRelay(http(), {
  plugins: [Relay.multisig({ store })],
})
```
