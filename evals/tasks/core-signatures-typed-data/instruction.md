Our exchange backend approves off-chain orders with EIP-712 typed-data
signatures.

Implement and export a zero-input `example()` function in `src/index.ts`. It
must sign this fixed order with the private key below, recover the signing
address without network access, and also recover the address obtained after
changing the amount to `2000000` while keeping the original signature:

Orders are encoded with:

- domain: `{ name: 'Order Book', version: '1', chainId: 1 }`
- primary type `Order`, declared as
  `Order(address maker,address taker,uint256 amount,uint256 nonce)`
- maker: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- taker: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- amount: `1000000`
- nonce: `1`
- private key:
  `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

Return the signature, recovered address, and address recovered from the
changed order.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
