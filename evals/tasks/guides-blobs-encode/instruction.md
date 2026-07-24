Our rollup posts batches of data to Ethereum as EIP-4844 blob sidecars, and we
need helpers to prepare that data before sending and to recover it afterwards.

Implement both functions in `src/index.ts`:

- `encodeBlobs({ value })` takes a UTF-8 string and returns it encoded as an array
  of EIP-4844 blobs (`0x`-prefixed hex strings), ready to attach to a blob
  transaction.
- `decodeBlobs({ blobs })` takes an array produced by `encodeBlobs` and returns
  the original string.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
