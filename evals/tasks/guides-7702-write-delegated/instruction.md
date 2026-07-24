Our onboarding flow upgrades user accounts with EIP-7702. Some accounts are
already upgraded: the account's code delegates to a shared storage contract,
so calls to the account address execute that contract's code against the
account's own storage. The delegated implementation exposes:

- `function store(uint256 value)` writes `value` into storage.
- `function retrieve() view returns (uint256)` reads the stored value.

Implement `writeDelegated` in `src/index.ts`. It receives a Viem client bound
to an account whose delegation is already installed on chain, followed by an
options object containing `value`. Do not sign or broadcast any new
authorization. Send a transaction from that account to its own address calling
`store(value)`, wait until it is confirmed on chain, then call `retrieve()` at
the account address and return the result as a bigint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
