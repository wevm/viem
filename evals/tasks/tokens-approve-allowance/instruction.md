Our payments service delegates USDC spending on Ethereum mainnet. USDC lives
at `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` and has 6 decimals.

Implement and export a zero-input `example` function in `src/index.ts`. At
module scope, create one client for the owner account from private key
`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
and another for the spender account from private key
`0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`.

The example must let the spender use 25 USDC from the owner, read that
allowance, spend 10 USDC to
`0x90F79bf6EB2c4f870365E785982E1f101E93b906`, then read the remaining
allowance. Wait for both writes to confirm and return the allowance before and
after the spend.

Use the `viem` library already installed in this project. Configure both
clients for Ethereum mainnet and `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
