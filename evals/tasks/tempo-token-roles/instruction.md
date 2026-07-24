Our stablecoin platform separates duties: an admin account controls a token's
roles, while a separate operator account is granted permission to mint supply.
On Tempo, TIP-20 tokens use role-based access control, and the `issuer` role
is required to mint.

Implement the following functions in `src/index.ts`:

- `createToken`: the first argument is a Tempo client carrying the admin
  account. Create a new TIP-20 token (currency `USD`) named by
  `options.name` and `options.symbol`. Return an
  object that includes the new token's address under a `token` key.
- `grantMintRole`: the first argument is a Tempo client carrying the admin
  account. Grant the `issuer` role on `options.token` to `options.grantee`.
- `hasMintRole`: the first argument is a Tempo client. Return `true` if
  `options.account` holds the `issuer` role on `options.token`, otherwise
  `false`.
- `mintTokens`: the first argument is a Tempo client carrying the minter
  account. Mint `options.amount` base units of `options.token` to `options.to`.
  If the mint is not
  permitted or the transaction fails, this function must throw.
- `revokeMintRole`: the first argument is a Tempo client carrying the admin
  account. Revoke the `issuer` role on `options.token` from
  `options.grantee`.

Every function that sends a transaction must wait until it is confirmed on
chain before returning, and must return an object that includes the
transaction receipt under a `receipt` key.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
