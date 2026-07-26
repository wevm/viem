Our Tempo onboarding service provisions fresh P256 wallets.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped accountless Tempo localnet client. Generate two independent
random P256 private keys and derive one account from each. Faucet-fund both
accounts, then have the first send `10.5` pathUSD to
`0x5151515151515151515151515151515151515151` and the second send `0.25`
pathUSD to `0x5252525252525252525252525252525252525252`. Each new account
must sign and pay its own fee. Wait for confirmation and return both sender
addresses and receipts.

pathUSD is `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a 100 ms
polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
