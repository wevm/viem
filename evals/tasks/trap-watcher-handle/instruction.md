Our monitoring service samples the first three new Ethereum blocks after it
starts, then must go completely quiet.

Implement and export a zero-input `example` function in `src/index.ts`. Create
an Ethereum mainnet client at module scope with a 100 ms polling interval.
Observe new block numbers, stop observing immediately after the third, and
resolve with those three bigints in observation order. The returned array must
never change after the function resolves.

Use the `viem` library already installed in this project. The RPC endpoint is
available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
