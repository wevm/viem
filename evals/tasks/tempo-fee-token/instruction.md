Our payments service settles invoices in pathUSD, but treasury wants network
fees debited from a separate AlphaUSD balance instead of eating into pathUSD.

Implement `transferToken` in `src/index.ts` so it transfers pathUSD from one
account to another while paying the transaction fee in AlphaUSD:

- The first argument is a Tempo client carrying the sending account.
- `options.to` is the recipient address.
- `options.amount` is a human-readable decimal string (for example `'10.5'` means
  10.5 pathUSD).

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
and AlphaUSD is a TIP-20 stablecoin at
`0x20c0000000000000000000000000000000000001`; both have 6 decimals. The
transfer itself must move pathUSD only; the fee must come out of the sender's
AlphaUSD balance.

On Tempo, a token is only accepted for fee payment once the network's Fee AMM
has liquidity for it. On a fresh network AlphaUSD has none, so before sending
the transfer your function must add liquidity to the AlphaUSD fee pool (a
deposit of 1,000 pathUSD on the validator-token side is plenty; the sender
holds ample pathUSD). Note that this liquidity-provisioning transaction must
pay its own fee in pathUSD, since AlphaUSD is not a valid fee token until the
liquidity lands.

Wait until the transfer is confirmed on chain before returning, and return an
object that includes the transaction receipt under a `receipt` key.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
