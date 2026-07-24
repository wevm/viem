We integrate with token contracts that ship no ABI in this codebase; we only
know the 4-byte selector of the function we need.

Implement `getTokenBalance` in `src/index.ts`. It receives a Viem client first
and an options object containing a token contract address and holder address.
Execute a raw `eth_call` against the token
contract with calldata you encode by hand: the `balanceOf(address)` selector
`0x70a08231` followed by the holder address ABI-encoded as a 32-byte word.
Decode the returned bytes into the holder's balance as a bigint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
