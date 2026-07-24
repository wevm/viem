Our contract tooling needs to report why a call failed, not just that it
failed.

Implement `getRevertError` in `src/index.ts`. It receives a Viem client first
and an options object containing a contract address, the contract's ABI (which
includes the custom error definitions), and the name of a read-only contract
function that takes no arguments. It should call that function on the contract
and, when the call reverts with a custom Solidity error, return
`{ errorName, args }`: the error's name and decoded argument values, decoded
against the provided ABI. You may assume the call always reverts with a custom
error that is present on the ABI.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
