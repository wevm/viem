Our app covers a user's Tempo transaction fee with a separate sponsor account.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the sender derived from private key
`0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356`
and a local sponsor account from private key
`0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e`.
Send `12.34` pathUSD to
`0x4545454545454545454545454545454545454545`, with the sponsor paying the
fee. Wait for confirmation and return the result.

pathUSD is at `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the `viem` library already installed in this project.
Configure the client with `http://tempo:8545` and a 100 ms polling interval.
Do not add any new dependencies.

When you are done, `npm run build` must pass.
