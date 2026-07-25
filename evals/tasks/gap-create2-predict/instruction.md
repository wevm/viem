Our release pipeline publishes the same contract to many chains and must know
the contract's address before the deployment transaction is sent.

Export a zero-input `example()` function from `src/index.ts`. It should:

1. Locally predict the CREATE2 address for creation bytecode
   `0x6001600c60003960016000f300` and salt
   `0x000000000000000000000000000000000000000000000000000000000000002a`
   using Viem's canonical CREATE2 deployer address.
2. Deploy that bytecode with CREATE2 and wait for inclusion. Use the chain's
   configured deployer rather than hard-coding its address or constructing
   deployer calldata manually.
3. Confirm code exists at the predicted address.
4. Return `{ predicted, deployed }`, where both values identify the deployed
   contract.

Create the Ethereum mainnet client at module scope with a 100 ms polling
interval, the available RPC endpoint, and the account derived from Anvil's
first funded private key:
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
