Our library runs inside host apps that hand us a wallet provider object
instead of an RPC URL. The provider is EIP-1193 style: an object with a single
`request({ method, params })` method that resolves with the JSON-RPC result.

Implement two functions in `src/index.ts`:

- `createTransport(options)` receives an options object containing the
  provider and returns a transport that routes RPC traffic through its
  `request` method.
- `getEthBalance(client, options)` receives a client using that transport and
  an options object containing an address, then returns its ETH balance in wei
  as a bigint.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

An Ethereum mainnet RPC endpoint is available at `http://anvil:8545` if you
want to point a test provider at a real node.

When you are done, `npm run build` must pass.
