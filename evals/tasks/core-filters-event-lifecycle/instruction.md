Our indexer sweeps ERC-20 activity in short, on-demand passes and must not
leak state on the node between passes.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope, bound to Binance 14
(`0x28C6c06298d514Db089934071355E5743bf21d60`) as a node-managed account.
Install a node-side filter for USDC transfers, then impersonate that account
and send:

- `1230000` units to `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- `45000000` units to `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

Between those transfers, send `999` units of WETH
(`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`) to the first recipient.
This unrelated transfer must not appear in the USDC filter results.

Poll and decode the two USDC transfers in log order, uninstall the filter even
if polling fails, stop impersonating the account, and return the transfers
plus the uninstall result.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
