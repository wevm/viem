Our test harness needs a helper that force-sets an account's ETH balance on
our dev node and confirms the node applied it.

The node is Anvil, which exposes a non-standard JSON-RPC method on top of the
regular Ethereum API:

- `anvil_setBalance` — params `[address, balance]`, where `balance` is the new
  balance in wei as a hex quantity (e.g. `'0x2a'`); returns nothing.

Implement and export a zero-input `example()` function in `src/index.ts`.
Define a typed, validated schema for the custom method and construct an
Ethereum mainnet client with it at module scope. Set
`0x4242424242424242424242424242424242424242` to
`123456789012345678901` wei, then read and return its resulting balance.

The raw request must be fully type-checked without assertions.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
