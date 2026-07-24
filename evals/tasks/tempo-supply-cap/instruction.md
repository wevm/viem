Our token issuance service launches stablecoins with a hard supply ceiling.

Implement `launchCappedToken` in `src/index.ts`:

- The first argument is a Tempo client carrying the issuing account, which
  becomes the token's admin.
- `options.name` and `options.symbol` name the new token.
- `options.cap` is a human-readable decimal string for the maximum supply
  (the token uses 6 decimals, for example `'1000'` means 1000 tokens).
- `options.to` is the address that receives the minted tokens.

The function must:

1. Create a new TIP-20 stablecoin (USD currency) administered by the issuing
   account.
2. Configure the token so its total supply can never exceed `cap`.
3. Mint exactly `cap` tokens to `to`. The issuing account must first give
   itself permission to mint.
4. Attempt one more mint of a nonzero amount. Now that the cap is reached,
   this attempt must be rejected on chain.

Wait for each step to be confirmed on chain. Return an object with:

- `token`: the new token's address.
- `mintReceipt`: the transaction receipt of the successful mint.
- `overCapMintFailed`: `true` if the extra mint was rejected, `false` if it
  unexpectedly succeeded.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. The
issuing account holds pathUSD
(`0x20c0000000000000000000000000000000000000`) to pay fees. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
