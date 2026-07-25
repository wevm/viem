Our Tempo treasury uses native 2-of-3 multisig accounts.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the funding account derived from
private key
`0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356`.
Build a multisig whose three equal-weight owners are derived from private keys
`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`,
`0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`,
and `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`.

Fund it, prepare one transaction sending `10.5` pathUSD to
`0x4545454545454545454545454545454545454545`, collect approvals from the
first and third owners, broadcast it, and wait for confirmation.

Build a second 2-of-3 multisig from owners derived from
`0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`,
`0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba`,
and `0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e`.
Prepare a 3 pathUSD transfer to
`0x4646464646464646464646464646464646464646`, approve it with only the
second owner, and demonstrate that broadcasting below the threshold fails.
Only classify the expected multisig authorization failure as rejection; let
unrelated errors propagate. Return the successful multisig address and receipt
plus the rejection result.

pathUSD is `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a 100 ms
polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
