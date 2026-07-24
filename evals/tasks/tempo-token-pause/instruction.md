Our stablecoin issuance service needs an emergency brake: the ability to halt
all transfers of a token we issued and later resume them.

Implement the following functions in `src/index.ts`. Each receives a Tempo
client carrying the acting account as its first argument.

- `setupToken`: issue a new TIP-20 stablecoin (USD currency; pick
  any name and symbol), make sure the issuing account is permitted to mint the
  token and to pause and unpause its transfers, then mint exactly 1000 tokens
  (the token uses 6 decimals) to the issuing account. Wait until everything is
  confirmed on chain and return the new token's address.
- `pauseToken`: halt all transfers of `options.token`; wait until confirmed.
- `unpauseToken`: resume transfers of `options.token`; wait until confirmed.
- `transferToken`: transfer `options.amount` (a
  human-readable decimal string, for example `'12.5'`; the token uses 6
  decimals) of `options.token` to `options.to`. Wait for confirmation and return an object
  that includes the transaction receipt under a `receipt` key. While the token
  is paused the transfer cannot succeed; let that failure propagate as a
  thrown error.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. The
account for private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` holds
pathUSD to cover transaction fees. Do not add any new dependencies.

When you are done, `npm run build` must pass.
