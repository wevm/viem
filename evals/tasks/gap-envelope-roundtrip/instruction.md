Our signing pipeline works with raw EIP-1559 (type 2) transactions: we build
them offline, ship the serialized bytes between services, and parse them back
on the other side.

Implement the three functions in `src/index.ts`:

- `serializeTransaction(options)` receives an options object containing a
  transaction and returns its raw serialized wire form as a `0x02`-prefixed
  hex string. When the transaction carries signature values (`yParity`, `r`,
  `s`), they must be included in the serialized payload.
- `deserializeTransaction(options)` receives an options object containing a
  serialized transaction and parses it back into its structured fields,
  including signature values when present.
- `hashTransaction(options)` receives an options object containing a signed
  transaction and returns its transaction hash (the hash a block explorer
  would show for it).

Do not hand-roll RLP encoding or hashing. Use the `viem` library already
installed in this project. Do not add any new dependencies.

When you are done, `npm run build` must pass.
