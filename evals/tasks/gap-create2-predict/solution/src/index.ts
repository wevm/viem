import { Actions, Addresses, type Chain, type Client } from 'viem'
import { ContractAddress, type Hex } from 'viem/utils'

export async function deployDeterministic<
  const chain extends Chain.Chain & {
    contracts: { create2: Chain.Chain.Contract }
  },
>(client: Client.Client<chain>, options: deployDeterministic.Options) {
  const { bytecode, salt } = options
  const predicted = ContractAddress.fromCreate2({
    bytecode,
    from: Addresses.create2,
    salt,
  })
  await Actions.contract.deploySync(client, {
    abi: [],
    bytecode,
    salt,
  })
  const code = await Actions.address.getCode(client, { address: predicted })
  if (!code || code === '0x') throw new Error('no code at predicted address')
  return { predicted, deployed: predicted }
}

export declare namespace deployDeterministic {
  type Options = {
    bytecode: Hex.Hex
    salt: Hex.Hex
  }
}
