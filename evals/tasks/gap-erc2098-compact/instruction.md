Our order book stores signatures in the ERC-2098 compact form to save
storage: 64 bytes instead of 65, with the recovery bit packed into the
highest bit of the second 32-byte word (`yParityAndS`).

Implement the two functions in `src/index.ts`:

- `toCompactSignature(options)` receives an options object containing a
  65-byte serialized ECDSA signature as a hex string (32-byte `r`, then
  32-byte `s`, then a 1-byte recovery value that may be 27/28 or 0/1) and
  returns its 64-byte ERC-2098 compact representation as a hex string.
- `fromCompactSignature(options)` receives an options object containing a
  64-byte compact hex string and returns the structured signature
  `{ r, s, yParity }`, where `r` and `s` are 32-byte hex strings and
  `yParity` is `0` or `1`.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
