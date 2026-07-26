Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. In one batched contract
request, read the underlying asset, total assets, and assets represented by
one whole share (`1000000000000000000` units) from the sDAI ERC-4626 vault at
`0x83F20F44975D03b1b09e64809B757c47f942BEeA`. Return the three decoded
values as one object.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
