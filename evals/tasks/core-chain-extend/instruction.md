Our team deploys an in-house contract to Ethereum mainnet, and our tooling
needs a chain configuration that knows where it lives.

Implement and export a zero-input `example()` function in `src/index.ts`. It
must derive a chain configuration from the Ethereum mainnet definition that
ships with `viem`, without mutating that definition. The derived chain must
retain mainnet's identity and RPC configuration while adding a `registry`
contract at `0x000000000000000000000000000000000000c0dE`.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
