Our dashboard signs EIP-712 permits and needs Ethena USDe's signing domain.
USDe at `0x4c9EDD5852cd905f086C759E8383e09bff1E68B3` exposes the ERC-5267
`eip712Domain()` view.

Implement and export a zero-input `example` function in `src/index.ts`. Create
an Ethereum mainnet client at module scope, read that view, and return its
named `name`, `version`, and `chainId` outputs as an object. Keep `chainId` as
a bigint.

Use the `viem` library already installed in this project. The RPC endpoint is
available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
