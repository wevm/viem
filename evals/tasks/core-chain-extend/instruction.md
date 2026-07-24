Our team deploys an in-house contract to Ethereum mainnet, and our tooling
needs a chain configuration that knows where it lives.

Implement `withContract` in `src/index.ts`. Given a contract collection keyed
by name in an options object, where each entry contains its address, it returns
a new chain configuration derived from the Ethereum mainnet chain definition
that ships with `viem`: the result keeps mainnet's id, name, RPC URLs, and
other properties, and additionally lists the given contract in the chain's
contract collection. Calling it must not modify the mainnet definition
itself. Use the `viem` library already installed in this project. Do not add
any new dependencies.

When you are done, `npm run build` must pass.
