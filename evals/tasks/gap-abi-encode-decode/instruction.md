Our backend builds ERC-20 calls and parses their raw results without a full
client.

Implement and export a zero-input `example()` function in `src/index.ts`. It
must:

- Use the bundled ERC-20 ABI to encode a `transfer(address,uint256)` call that
  transfers `1000000` units to
  `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`.
- Use the same ABI to decode a `balanceOf(address)` result from
  `0x000000000000000000000000000000000000000000000000000000076bbef763`.

Return the encoded calldata and decoded bigint. Do not hand-assemble the
calldata.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
