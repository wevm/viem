Our market monitor reads the latest completed rounds from Chainlink-compatible
price feeds.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope and concurrently read the
latest completed round from the ETH/USD feed at
`0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419` and BTC/USD feed at
`0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c`. Return both decoded results,
including each round id, signed answer, timestamps, and answered-in round. The
price feed ABI is already provided in `src/abi.ts`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
