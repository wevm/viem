Our Tempo compliance service blocks incoming funds and lets the original
sender reclaim them.

Implement and export a zero-input `example` function in `src/index.ts`. Derive
module-scoped accounts for the sender from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
and the receiving account derived from private key
`0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`.
Create one Tempo localnet client for the sender. Install a receive policy that
rejects every sender and lets the original sender reclaim blocked transfers.

Send `12.5` pathUSD to the receiving account, extract the encoded claim
receipt from the blocked-transfer event, and read the blocked amount. Then
claim it to `0x4545454545454545454545454545454545454545` and read the blocked
amount again. Return both writes, the claim receipt, and both amounts.

pathUSD is `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a 100 ms
polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
