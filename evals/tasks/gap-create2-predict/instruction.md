Our release pipeline publishes the same contract to many chains and must know
the contract's address before the deployment transaction is ever sent.

Implement `deployDeterministic` in `src/index.ts`. It receives a Viem client
bound to the funded deployment account first and an options object containing
a contract's creation bytecode and 32-byte salt. It must:

1. Compute locally (before sending anything) the CREATE2 address the contract
   will live at using Viem's canonical CREATE2 deployer address. The resulting
   address depends on the deployer's address, the salt, and the creation
   bytecode.
2. Deploy with Viem's contract deployment action and wait until the transaction
   is included. Use the client's chain configuration and the supplied salt;
   do not hard-code a deployer address or manually construct its calldata.
3. Confirm the contract's code exists on chain, then return
   `{ predicted, deployed }`: `predicted` is the locally computed address and
   `deployed` is the address the code actually lives at.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
