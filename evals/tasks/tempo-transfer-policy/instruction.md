Our Tempo compliance team needs a stablecoin restricted to approved accounts.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the admin derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Create a USD TIP-20 token, grant issuance permission, and mint exactly 1,000
tokens to the admin. Create and activate an admin-controlled whitelist that
initially contains only the admin.

Demonstrate that sending 1 token to
`0x4646464646464646464646464646464646464646` fails. Add
`0x4545454545454545454545454545454545454545` to the whitelist, send it 2.5
tokens, and wait for confirmation. Return the token, policy id, rejection
result, and successful transfer. Only classify the expected contract revert
as rejection; let unrelated errors propagate.

The token has 6 decimals. Use the installed `viem`, `http://tempo:8545`, and
a 100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
