Before our payouts service queues a USDC transfer for signing, it dry-runs the
transfer to catch failures early.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope. Without submitting any
transaction, dry-run these USDC transfers to
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`:

- `1000000` units from Binance 14
  (`0x28C6c06298d514Db089934071355E5743bf21d60`)
- `40000000000` units from Binance 14
- `1000000` units from the empty address
  `0xa1484a31504c80e30ce0a25c8f94dbaee9cde6bc`

Use each prospective sender as the call's identity even though no private key
is available. Return whether each transfer would succeed, treating execution
reverts as `false`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
