import { Account } from 'viem'
import { type Address, type Hex, TypedData } from 'viem/utils'

export type Order = {
  maker: Address.Address
  taker: Address.Address
  amount: bigint
  nonce: bigint
}

function toTypedData(order: Order) {
  return {
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
}

export async function signOrder(options: signOrder.Options): Promise<Hex.Hex> {
  const { order, privateKey } = options
  return Account.fromPrivateKey(privateKey).signTypedData(toTypedData(order))
}

export declare namespace signOrder {
  type Options = {
    order: Order
    privateKey: Hex.Hex
  }
}

export function recoverOrderAddress(
  options: recoverOrderAddress.Options,
): Address.Address {
  const { order, signature } = options
  return TypedData.recoverAddress({
    ...toTypedData(order),
    signature,
  })
}

export declare namespace recoverOrderAddress {
  type Options = {
    order: Order
    signature: Hex.Hex
  }
}
