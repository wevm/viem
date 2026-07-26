import { TxEnvelopeEip1559 } from 'viem/utils'

const transaction = TxEnvelopeEip1559.from({
  chainId: 1,
  data: '0xdeadbeef',
  gas: 21_000n,
  maxFeePerGas: 20_000_000_000n,
  maxPriorityFeePerGas: 2_000_000_000n,
  nonce: 785n,
  r: '0xa5b80dfdacf4e6381a4ddce65df848eb313bde2878cb490613b4fa566ad23884',
  s: '0x1d53222d3bf7436eb076c63ea236ae2ce4a45544fbaf48236c1b9ca4f91133e6',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1_000_000_000_000_000_000n,
  yParity: 0,
})

export function example() {
  const serialized = TxEnvelopeEip1559.serialize(transaction)
  return {
    deserialized: TxEnvelopeEip1559.deserialize(serialized),
    hash: TxEnvelopeEip1559.hash(transaction),
    serialized,
  }
}
