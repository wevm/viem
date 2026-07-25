Our wallet backend derives user signing addresses from a BIP-39 recovery
phrase.

Implement and export a zero-input `example()` function in `src/index.ts`.
Using the recovery phrase
`test test test test test test test test test test test junk`, return:

- `indexed`: the addresses at indexes 0, 1, and 2 of the standard Ethereum
  derivation path.
- `custom`: the address at `m/44'/60'/1'/0/0`.
- `passphrase`: the default-path address derived with the BIP-39 passphrase
  `passphrase`.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
