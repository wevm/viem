Our indexer sweeps ERC-20 activity in short, on-demand passes and must not
leak state on the node between passes.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct one Ethereum mainnet client at module scope. Use the first two Anvil
default accounts, derived from these private keys:

- `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

Wrap 1 ETH from the first account into WETH at
`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`, then give the second account
`999` base units before installing the filter.

Install a node-side WETH `Transfer` filter scoped to transfers from the first
account, then send:

- `1230000` units from the first account to the second account
- `999` units from the second account to
  `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- `45000000` units from the first account to
  `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

The second account's transfer must not match the sender-scoped filter. Poll
and decode the two matching transfers in log order, uninstall the filter even
if polling fails, and return the transfers plus the uninstall result.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
