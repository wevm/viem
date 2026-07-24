Our app covers transaction fees on behalf of its users so sending money feels
gasless to them.

Implement `sponsoredTransfer` in `src/index.ts` so it transfers pathUSD from a
user's account to a recipient while a separate sponsor account pays the
transaction fees:

- The first argument is a Tempo client carrying the user's sending account.
- `options.feePayer` is the sponsor's local Account. Every fee for the
  transaction must be paid by the sponsor (in pathUSD), never by the sender.
- `options.to` is the recipient address.
- `options.amount` is a human-readable decimal string (for example `'10.5'` means
  10.5 pathUSD).

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals. The sender's pathUSD balance must decrease by exactly the
transfer amount and nothing more. Wait until the transfer is confirmed on
chain before returning, and return an object that includes the transaction
receipt under a `receipt` key.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
