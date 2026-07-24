Our liquidity monitor snapshots arbitrary Uniswap V3 pools, and every extra
RPC round trip slows it down.

Export a client configured so reads fired together in the same tick are
aggregated into a single batched RPC request. Implement `getPoolState` so it
receives that client first and an options object containing a pool address,
then returns the pool's current `feeGrowthGlobal0X128`, `liquidity`,
`sqrtPriceX96`, `tick`, and `unlocked` values. Uniswap V3 pools expose these
through `feeGrowthGlobal0X128()`, `liquidity()`, and `slot0()` view functions.
Issue the three reads concurrently.

The WETH/USDC 0.05% pool at
`0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640` can be used to verify. Use the
`viem` library already installed in this project. An Ethereum mainnet RPC
endpoint is available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
