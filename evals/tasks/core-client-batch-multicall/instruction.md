Our liquidity monitor snapshots arbitrary Uniswap V3 pools, and every extra
RPC round trip slows it down.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope so reads fired together
in the same tick are aggregated into one batched RPC request. Concurrently
read the WETH/USDC 0.05% pool's `feeGrowthGlobal0X128()`, `liquidity()`, and
`slot0()` views, then return its `feeGrowthGlobal0X128`, `liquidity`,
`sqrtPriceX96`, `tick`, and `unlocked` values.

The pool is at `0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640`. Use
the `viem` library already installed in this project. An Ethereum mainnet RPC
endpoint is available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
