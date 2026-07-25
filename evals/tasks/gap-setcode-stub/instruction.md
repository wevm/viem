Our test suite needs to fake an on-chain data feed without deploying
anything: install prepared runtime bytecode directly at a chosen address and
seed its storage so reads behave as if a real contract lived there.

Export a zero-input `example()` function from `src/index.ts`. The node is a
local Anvil instance, so development-time state controls are available.

For each entry below, install runtime bytecode
`0x60005460005260206000f3`, write the value to storage slot 0 as a 32-byte
word, then call `getValue()` on the contract. The view function returns the
`uint256` held in slot 0.

- Address `0x51ab7042d3cbeff0e5c25671e419b1682d29d757`, value
  `481516234233`
- Address `0xc0ffee254729296a45a3885639ac7e10f9d54979`, value `42`

Return `{ first, second }`, containing the two values read back in order.
Create the Ethereum mainnet client at module scope with the available RPC
endpoint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint (the Anvil fork) is available at `http://anvil:8545`. Do not add
any new dependencies.

When you are done, `npm run build` must pass.
