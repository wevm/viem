Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an account-bound Ethereum mainnet client at module scope using the
Anvil default private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Wrap 1 ETH by sending it to WETH, then simulate a transfer of 12,345,678 WETH
base units to
`0x4242424242424242424242424242424242424242` with Viem's token transfer
action. Submit the request returned by the simulation and wait for confirmation
with the synchronous transaction send action. Return the simulated result,
receipt, amount, recipient, and token address.

Use the `viem` library already installed in this project. WETH is deployed at
`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`, and an Ethereum mainnet RPC
endpoint is available at `http://anvil:8545`. Do not add dependencies. When
you are done, `npm run build` must pass.
