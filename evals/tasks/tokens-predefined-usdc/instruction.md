Our wallet app must not maintain its own token address list; it relies on the
token definitions that ship with the viem library.

Implement two functions in `src/index.ts`:

- `getUsdcAddress` returns the USDC contract address on Ethereum mainnet,
  resolved from viem's bundled token definitions. Do not hard-code the
  address.
- `getUsdcMetadata(client)` reads the token's metadata from the chain at that
  address and returns its `decimals`, `name`, and `symbol`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
