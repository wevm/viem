import { Actions, type Client } from 'viem'
import { ContractAddress, type Hex } from 'viem/utils'

const deployer = '0x4e59b44847b379578588920ca78fbf26c0b4956c'

export async function deployDeterministic(
  client: Client.Client,
  options: deployDeterministic.Options,
) {
  const { bytecode, salt } = options
  const predicted = ContractAddress.fromCreate2({
    bytecode,
    from: deployer,
    salt,
  })
  await Actions.contract.deploySync(client, {
    abi: [],
    bytecode,
    create2Address: deployer,
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
