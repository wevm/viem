Our library runs inside host apps that hand us a wallet provider object
instead of an RPC URL. The provider is EIP-1193 style: an object with a single
`request({ method, params })` method that resolves with the JSON-RPC result.

Implement and export a zero-input `example()` function in `src/index.ts`.
Define an EIP-1193 provider that forwards requests to `http://anvil:8545`,
construct an Ethereum mainnet client from that provider at module scope, and
return the ETH balance of `0x5151515151515151515151515151515151515151`
as a bigint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
