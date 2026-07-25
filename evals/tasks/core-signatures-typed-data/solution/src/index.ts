import { Account } from 'viem'
import { TypedData } from 'viem/utils'

const account = Account.fromPrivateKey(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)

const order = {
  amount: 1_000_000n,
  maker: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  nonce: 1n,
  taker: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
} as const

export async function example() {
  const typedData = {
    domain: { chainId: 1, name: 'Order Book', version: '1' },
    message: order,
    primaryType: 'Order',
    types: {
      Order: [
        { name: 'maker', type: 'address' },
        { name: 'taker', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
  } as const
  const signature = await account.signTypedData(typedData)
  const recovered = TypedData.recoverAddress({
    ...typedData,
    signature,
  })
  const changedRecovered = TypedData.recoverAddress({
    ...typedData,
    message: { ...order, amount: 2_000_000n },
    signature,
  })
  return { changedRecovered, recovered, signature }
}
