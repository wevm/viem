Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. Ask the connected node
to complete every field needed to sign a 0.25 ETH transfer from
`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` to
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`, then return the completed
transaction.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
