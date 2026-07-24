Our release tooling needs a reusable helper for publishing compiled contracts.

Implement `deploy` in `src/index.ts`. It receives a Viem client bound to the
funded deployer account first, followed by an options object containing a
compiled artifact's ABI, creation bytecode, and optional constructor arguments.
Broadcast the deployment, wait until the contract exists on chain, and return
the deployed contract address.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
