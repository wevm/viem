Our test suite needs to fake an on-chain data feed without deploying
anything: install prepared runtime bytecode directly at a chosen address and
seed its storage so reads behave as if a real contract lived there.

Implement `stubContract` in `src/index.ts`. It receives a Viem client first and
an options object containing a contract address, runtime bytecode, and bigint
value, then returns the stored value as a bigint. The node is a local Anvil
instance, so development-time state controls are available. The function must:

1. Replace whatever code is stored at `address` with `bytecode`.
2. Write `value` into the contract's storage slot 0 as a 32-byte word.
3. Call `getValue()` on the contract at `address` (a view function returning
   the `uint256` held in slot 0) and return the result.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint (the Anvil fork) is available at `http://anvil:8545`. Do not add
any new dependencies.

When you are done, `npm run build` must pass.
