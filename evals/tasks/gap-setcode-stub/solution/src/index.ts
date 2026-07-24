import { Actions, type Client } from 'viem'
import { Abi, type Address, Hex } from 'viem/utils'

const abi = Abi.from(['function getValue() view returns (uint256)'])

export async function stubContract(
  client: Client.Client,
  options: stubContract.Options,
): Promise<bigint> {
  const { address, bytecode, value } = options
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

export declare namespace stubContract {
  type Options = {
    address: Address.Address
    bytecode: Hex.Hex
    value: bigint
  }
}
