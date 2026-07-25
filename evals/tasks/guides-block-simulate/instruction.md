Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. Without broadcasting,
simulate one block containing two calls from
`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`: send 1 ETH to
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8` and 2 ETH to
`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`. Return each call's status and
gas usage in order.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
