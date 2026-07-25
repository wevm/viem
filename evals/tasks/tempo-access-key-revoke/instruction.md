Our Tempo treasury grants, inspects, spends through, and revokes a limited
session key.

Implement and export a zero-input `example` function in `src/index.ts`. At
module scope, derive the root account from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
and its secp256k1 access key from private key
`0x5fe1a3c2f2f7cbb2e6c8e6b092de2e04ae0d24a655e42e15a4f0f37b78f4e989`.
Create a Tempo localnet client for each.

Authorize the key for one hour with a 50,000,000-base-unit pathUSD limit.
Read its remaining limit, spend 5,000,000 base units to
`0x4242424242424242424242424242424242424242`, read the reduced limit, then
revoke the key. Attempt another 1,000,000-base-unit spend and return the
write results, both limits, and whether that final spend was rejected. Only
classify the expected contract revert as rejection; let unrelated errors
propagate.

pathUSD is `0x20c0000000000000000000000000000000000000`.
Use the installed `viem`, `http://tempo:8545`, and a 100 ms polling interval.
Do not add dependencies.

When you are done, `npm run build` must pass.
