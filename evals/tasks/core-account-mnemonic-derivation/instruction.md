Our wallet backend derives user signing addresses from a BIP-39 recovery
phrase.

Implement the three functions in `src/index.ts`:

- `deriveAddress` takes an options object containing a mnemonic and address
  index, then returns the address at that index of the standard Ethereum path
  (`m/44'/60'/0'/0/<addressIndex>`).
- `deriveAddressAtPath` takes a mnemonic and full custom derivation path in an
  options object, then returns the derived address.
- `deriveAddressWithPassphrase` takes a mnemonic and BIP-39 passphrase in an
  options object, then returns the address at the default path.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
