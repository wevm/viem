Before submitting a transaction, our dapp checks whether a contract call would
fail and shows the failure to the user in plain English.

Implement `getRevertReason` in `src/index.ts`. It receives a Viem client first
and an options object containing a contract ABI, contract address, and
function name. It must execute the call against the chain (no transaction
should be mined) and return the reason string the call reverted with; that is,
the message passed to Solidity's `revert("...")`. The calls it is used with
take no arguments and always revert with a reason string. Use the `viem`
library already installed in this project. An Ethereum mainnet RPC endpoint
is available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
