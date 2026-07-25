Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an account-bound Ethereum mainnet client at module scope using
private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Deploy bytecode
`0x6020601c5f395f515f55600860145f3960085ff35f545f5260205ff3` with an
address constructor argument of
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`. The deployed contract exposes
`owner() view returns (address)`. Wait for deployment and return the contract
address together with the expected owner.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
