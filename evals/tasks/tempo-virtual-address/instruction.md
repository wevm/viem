Our payments platform accepts deposits through Tempo virtual addresses
(TIP-1022). A wallet registers itself once as a "master" in the protocol's
address registry. Registration requires a salt that satisfies the TIP-1022
proof-of-work requirement; the salt also determines the 4-byte master id the
wallet is registered under. Virtual deposit addresses embed that master id as
`[4-byte master id][10-byte marker 0xfdfdfdfdfdfdfdfdfdfd][6-byte user tag]`,
and the registry resolves them back to the master wallet.

Implement the following in `src/index.ts`:

- `registerMasterAddress`: the first argument is a Tempo client carrying the
  master account. Mine a salt that satisfies the proof-of-work requirement,
  searching upward from `options.saltStart` (callers pass a hint; a valid salt exists
  within a few thousand values above it). Register the account as a master
  with that salt and wait until the registration is confirmed on chain.
  Return an object with the 4-byte `masterId`, the registered
  `masterAddress`, and the transaction `receipt`.
- `deriveVirtualAddress`: this pure helper receives one options object and
  returns the virtual deposit address for its 4-byte `masterId` and 6-byte
  `userTag`.
- `resolveVirtualAddress`: the first argument is a Tempo client. Return the
  wallet a payment to `options.address` is forwarded to. A virtual address
  resolves to its registered master; an
  address that is not virtual comes back unchanged; a virtual address whose
  master id was never registered resolves to `null`.

For local testing: the dev account
`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`) holds
funds at genesis, and `0xabf52b00n` is a valid `saltStart` for it.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
