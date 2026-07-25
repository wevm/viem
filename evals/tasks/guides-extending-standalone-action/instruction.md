Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. Define a private
standalone operation that reads the balance and transaction count of
`0x1111111111111111111111111111111111111111`. Extend the client with the
same behavior at `accounts.getSummary()`, call both forms, and return their
results.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
