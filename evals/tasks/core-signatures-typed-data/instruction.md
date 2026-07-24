Our exchange backend approves off-chain orders with EIP-712 typed-data
signatures.

Implement the two functions in `src/index.ts`:

- `signOrder(options)` receives an options object containing a private key and
  order, signs the order as EIP-712 typed data, and returns the signature as a
  hex string.
- `recoverOrderAddress(options)` receives an options object containing an order
  and signature, then returns the signing address synchronously without any
  network access.

Orders are encoded with:

- domain: `{ name: 'Order Book', version: '1', chainId: 1 }`
- primary type `Order`, declared as
  `Order(address maker,address taker,uint256 amount,uint256 nonce)`

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
