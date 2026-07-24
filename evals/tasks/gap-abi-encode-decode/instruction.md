Our backend builds ERC-20 calls and parses their raw results without a full
client.

Implement the two functions in `src/index.ts`:

- `encodeTransferData(options)` receives an options object containing a
  recipient and amount, then returns the complete calldata (a `0x`-prefixed
  hex string including the 4-byte selector) for an ERC-20
  `transfer(address,uint256)` call. Derive the call's ABI definition by parsing
  its human-readable Solidity signature; do not hand-assemble hex.
- `decodeBalanceResult(options)` receives an options object containing the raw
  hex data returned by an ERC-20 `balanceOf(address)` call and decodes it into
  a bigint.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
