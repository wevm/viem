Our payments service delegates WETH spending on Ethereum mainnet. WETH lives
at `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` and has 18 decimals.

Implement and export a zero-input `example` function in `src/index.ts`. At
module scope, create one Ethereum mainnet client and derive the owner from
private key
`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
and the spender from private key
`0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`.

The example must first wrap 50 ETH for the owner. Let the spender use 25 WETH
from the owner, read that allowance, spend 10 WETH to
`0x90F79bf6EB2c4f870365E785982E1f101E93b906`, then read the remaining
allowance. Wait for every write to confirm and return the allowance before and
after the spend.

Use the `viem` library already installed in this project. Configure the client
for Ethereum mainnet and `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
