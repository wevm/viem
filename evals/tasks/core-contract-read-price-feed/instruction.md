Our market monitor reads the latest completed round from arbitrary
Chainlink-compatible price feeds.

Implement `getLatestRound` in `src/index.ts`. It receives a Viem client first
and an options object containing a feed address, then returns the decoded
result of `latestRoundData()`, including its round id, signed answer, start and
update timestamps, and answered-in round. The price feed ABI is already
provided in `src/abi.ts`.

The ETH/USD feed at `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419` can
be used to verify. Use the `viem` library already installed in this project.
An Ethereum mainnet RPC endpoint is available at `http://anvil:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
