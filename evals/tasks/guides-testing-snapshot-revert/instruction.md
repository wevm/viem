Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. Read the balance of
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`, snapshot the node, increase
the balance by 123,456,789 wei, read the temporary value, restore the
snapshot, and read the final balance. Return the before, during, and after
values.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
