Before submitting a transaction, our dapp checks whether a contract call would
fail and shows the failure to the user in plain English.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope and call `buyBeans()` on
`0x1111111111111111111111111111111111111111`. The call always reverts with a
Solidity reason string. Return that decoded reason without mining a
transaction.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
