import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi, type Address, Hex } from 'viem/utils'

const abi = Abi.from(['function getValue() view returns (uint256)'])
const bytecode = '0x60005460005260206000f3'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  async function stubContract(options: {
    address: Address.Address
    value: bigint
  }) {
    const { address, value } = options
    await Actions.address.setCode(client, { address, bytecode })
    await Actions.address.setStorageAt(client, {
      address,
      index: 0,
      value: Hex.fromNumber(value, { size: 32 }),
    })
    return Actions.contract.read(client, {
      abi,
      address,
      functionName: 'getValue',
    })
  }

  const first = await stubContract({
    address: '0x51ab7042d3cbeff0e5c25671e419b1682d29d757',
    value: 481_516_234_233n,
  })
  const second = await stubContract({
    address: '0xc0ffee254729296a45a3885639ac7e10f9d54979',
    value: 42n,
  })
  return { first, second }
}
