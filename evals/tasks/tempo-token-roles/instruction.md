Our Tempo stablecoin platform separates token administration from issuance.

Implement and export a zero-input `example` function in `src/index.ts`. Derive
module-scoped accounts for the admin from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
and the minter derived from private key
`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`.
Create one Tempo localnet client for the admin. Create `Role Token` (`ROLE`),
confirm the minter initially lacks issuance permission, grant it, mint
25,000,000 base units to
`0x4545454545454545454545454545454545454545`, revoke it, and demonstrate
that another 1,000,000-base-unit mint fails. Return the token, permission
checks, write results, and rejection result. Only classify the expected
contract revert as rejection; let unrelated errors propagate.

Use the installed `viem`, `http://tempo:8545`, and a 100 ms polling interval.
Do not add dependencies.

When you are done, `npm run build` must pass.
