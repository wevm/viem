Implement and export a zero-argument function named `example` in
`src/index.ts`.

Create a string containing `31 * 4096 + 1000` copies of `y`, encode it into
EIP-4844 blobs, decode those blobs back into text, and return the blobs
together with the decoded value. The input is intentionally larger than one
blob's usable capacity.

Use the `viem` library already installed in this project. Do not add
dependencies. When you are done, `npm run build` must pass.
