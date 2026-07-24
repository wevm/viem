Our test harness needs a helper that force-sets an account's ETH balance on
our dev node and confirms the node applied it.

The node is Anvil, which exposes a non-standard JSON-RPC method on top of the
regular Ethereum API:

- `anvil_setBalance` — params `[address, balance]`, where `balance` is the new
  balance in wei as a hex quantity (e.g. `'0x2a'`); returns nothing.

Export `schema` from `src/index.ts` as a typed, validated definition of the
custom method. Implement `setBalance` so it receives a client created with
that schema first, followed by an options object containing an address and
bigint amount in wei. It returns the resulting balance as a bigint and must:

1. call `anvil_setBalance` through a fully type-checked raw request (no `as`
   casts on the request) to set `address`'s balance to `wei`, and
2. read the account's balance back from the node and return it in wei.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
