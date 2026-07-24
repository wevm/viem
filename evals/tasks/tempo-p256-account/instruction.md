Our onboarding service provisions a fresh wallet for every new user. The
wallets sign with P256 (secp256r1) keys rather than standard Ethereum
secp256k1 keys.

Implement `transferFromNewAccount` in `src/index.ts` so it:

The first argument is a Tempo client. All other inputs are properties of one
options object.

1. Generates a random P256 (secp256r1) private key and derives a new account
   from it. Every call must produce a different account.
2. Funds the new account through the Tempo node's built-in faucet (the
   localnet faucet grants test stablecoin balances to any address on request)
   and waits until the funding is confirmed.
3. Transfers `options.amount` pathUSD from the new account to `options.to`,
   with the new account signing the transaction and paying its own fees. The
   amount is a
   human-readable decimal string (for example `'10.5'` means 10.5 pathUSD).
   Wait until the transfer is confirmed on chain.
4. Returns an object with:
   - `sender`: the new account's address.
   - `receipt`: the transaction receipt of the transfer.

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
