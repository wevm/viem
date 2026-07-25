Our signing pipeline works with raw EIP-1559 (type 2) transactions: we build
them offline, ship the serialized bytes between services, and parse them back
on the other side.

Implement and export a zero-input `example()` function in `src/index.ts`.
Using the fixed signed transaction below, return its raw serialized wire form,
the deserialized transaction, and its transaction hash:

- chain id: `1`
- nonce: `785`
- maximum priority fee: `2000000000`
- maximum fee: `20000000000`
- gas: `21000`
- recipient: `0x70997970c51812dc3a010c7d01b50e0d17dc79c8`
- value: `1000000000000000000`
- data: `0xdeadbeef`
- parity: `0`
- r: `0xa5b80dfdacf4e6381a4ddce65df848eb313bde2878cb490613b4fa566ad23884`
- s: `0x1d53222d3bf7436eb076c63ea236ae2ce4a45544fbaf48236c1b9ca4f91133e6`

Do not hand-roll RLP encoding or hashing. Use the `viem` library already
installed in this project. Do not add any new dependencies.

When you are done, `npm run build` must pass.
