Our compliance service uses account receive policies to control incoming
stablecoin transfers and to recover funds that a policy blocks.

On Tempo, an account can install a receive policy that rejects incoming
senders. A transfer into such an account still succeeds on chain, but instead
of crediting the recipient the network holds the funds and the transaction
emits an event carrying an encoded claim receipt (a hex byte string). An
authorized claimer (here: the original sender) can later release the held
funds to a destination address.

Implement the following in `src/index.ts`. pathUSD is a TIP-20 stablecoin at
`0x20c0000000000000000000000000000000000000` with 6 decimals. Every function
that sends a transaction must wait until it is confirmed on chain before
returning.

- `setBlockingPolicy`: the only argument is a Tempo client carrying the
  receiving account. Install a policy that rejects every incoming sender and
  authorizes the original sender of a blocked transfer to reclaim it. Return
  an object with the transaction receipt under a `receipt` key.
- `sendTokens`: the first argument is a Tempo client carrying the sender
  account. Transfer `options.amount` pathUSD (a human-readable decimal string,
  for example `'12.5'`) to `options.to`. The recipient's policy will block the
  transfer. Return `{ receipt, claimReceipt }` where `claimReceipt` is the
  encoded claim receipt emitted for the blocked transfer.
- `getBlockedAmount`: the first argument is a Tempo client. Return the amount
  currently held for `options.claimReceipt`, in base units as a `bigint`.
- `claimBlockedFunds`: the first argument is a Tempo client carrying the
  original sender account. Release the funds identified by
  `options.claimReceipt` to `options.to`. Return an
  object with the transaction receipt under a `receipt` key.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
