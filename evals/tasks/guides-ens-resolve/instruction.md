Our app shows human-readable ENS identities next to Ethereum addresses.

Implement two functions in `src/index.ts`:

- `resolveEnsAddress(client, { name })` returns the Ethereum address an ENS name resolves
  to, or `null` when the name has no address record.
- `resolveEnsName(client, { address })` returns the primary ENS name configured for an
  address, or `null` when none is set.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
