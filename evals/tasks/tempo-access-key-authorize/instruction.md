Our Tempo wallet provisions a P256 session key with a pathUSD spending cap.

Implement and export a zero-input `example` function in `src/index.ts`. At
module scope, derive the root account from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
and its P256 access key from scalar
`0x1111111111111111111111111111111111111111111111111111111111111111`.
Create a Tempo localnet client for each.

Authorize the key for one hour with a `100` pathUSD limit, then use it to send
`30.5` pathUSD to `0x5151515151515151515151515151515151515151`. Finally try
to send `75` pathUSD to `0x5252525252525252525252525252525252525252`, which
exceeds the remaining limit. Return both confirmed results and whether the
oversized transfer was rejected. Only classify the expected contract revert
as rejection; let unrelated errors propagate.

pathUSD is `0x20c0000000000000000000000000000000000000`
with 6 decimals and also pays access-key fees. Use the installed `viem`,
`http://tempo:8545`, and a 100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
