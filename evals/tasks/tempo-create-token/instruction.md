Our platform lets businesses launch their own USD stablecoins on Tempo.

Implement `createToken` in `src/index.ts` so it deploys a brand-new TIP-20
token and reports what actually landed on chain:

- The first argument is a Tempo client carrying the deploying account, which
  should also administer the new token.
- `options.name` and `options.symbol` are the token's name and symbol. The token is
  denominated in the `USD` currency.

Wait until the deployment is confirmed on chain, then read the new token's
onchain metadata back from the network. Return an object with:

- `token`: the address of the newly created token.
- `metadata`: the metadata read back from the chain, including at least
  `name`, `symbol`, and `decimals`.

Each call must create a fresh token, so calling the function twice with
different arguments yields two different token addresses.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
