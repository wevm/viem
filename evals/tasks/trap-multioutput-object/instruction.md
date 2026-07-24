Our dashboard signs EIP-712 permits and needs each token's signing domain.
Tokens that implement ERC-5267 expose it through an `eip712Domain()` view
function.

Implement `getSigningDomain` in `src/index.ts`. It receives a Viem client first
and an options object containing a token address, calls `eip712Domain()` on
that contract, and returns the decoded domain's `name`,
`version`, and `chainId` as `{ name, version, chainId }` (with `chainId` as
a bigint). Ethena's USDe token at
`0x4c9EDD5852cd905f086C759E8383e09bff1E68B3` implements ERC-5267 and can be
used to verify.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
