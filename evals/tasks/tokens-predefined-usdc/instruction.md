Our wallet app relies on the token definitions bundled with Viem instead of
maintaining its own address list.

Implement and export a zero-input `example` function in `src/index.ts`. Create
an Ethereum mainnet client at module scope, resolve USDC from the bundled token
definitions without hard-coding its address, and read its on-chain metadata.
Return the resolved address together with its decimals, name, symbol, and total
supply.

Use the `viem` library already installed in this project. The RPC endpoint is
available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
