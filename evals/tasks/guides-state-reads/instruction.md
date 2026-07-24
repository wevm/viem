Our explorer's account page shows a full state snapshot for any address.

Implement `getAccountState` in `src/index.ts`. It receives a Viem client first
and an options object containing an address (a `0x`-prefixed hex string).
Return an object with:

- `balance`: the address's ETH balance in wei, as a bigint.
- `nonce`: the address's transaction count, as a number.
- `code`: the bytecode deployed at the address, as a hex string (`undefined`
  if the address has no code).
- `storageSlot0`: the raw 32-byte value stored at the address's storage slot
  `0`, as a hex string.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
