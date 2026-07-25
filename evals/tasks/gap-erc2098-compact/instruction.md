Our order book stores signatures in the ERC-2098 compact form to save
storage: 64 bytes instead of 65, with the recovery bit packed into the
highest bit of the second 32-byte word (`yParityAndS`).

Implement and export a zero-input `example()` function in `src/index.ts`. It
must convert this 65-byte serialized ECDSA signature to its 64-byte ERC-2098
representation, then parse the compact value back into `r`, `s`, and parity:

`0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f5507931c`

Return the compact representation and parsed signature.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
