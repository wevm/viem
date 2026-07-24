import { Actions, type Client } from 'viem'
import { Abi } from 'viem/utils'

const abi = Abi.from([
  'function store(uint256 value)',
  'function retrieve() view returns (uint256)',
])

export async function writeDelegated(
  client: Client.Client,
  options: writeDelegated.Options,
): Promise<bigint> {
  const account = client.account
  if (!account) throw new Error('client account required')

  await Actions.contract.writeSync(client, {
    abi,
    address: account.address,
    args: [options.value],
    functionName: 'store',
  })

  return Actions.contract.read(client, {
    abi,
    address: account.address,
    functionName: 'retrieve',
  })
}

export declare namespace writeDelegated {
  type Options = {
    value: bigint
  }
}
