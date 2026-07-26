Our payments service sends Ethereum mainnet WETH from amounts users type into
a form.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped client for the account derived from private key
`0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`.
First wrap 2 ETH, then send exactly `1.5` WETH to
`0x4242424242424242424242424242424242424242`, wait for confirmation, and
return the transfer receipt. WETH has 18 decimals and is deployed at
`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`.

Use the `viem` library already installed in this project. Configure the client
for Ethereum mainnet and `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
