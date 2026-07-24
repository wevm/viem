import { Actions, type Client } from 'viem'
import { ContractAddress, Hex } from 'viem/utils'

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
  await Actions.transaction.sendSync(client, {
    data: Hex.concat(salt, bytecode),
    to: deployer,
  })
  const code = await Actions.address.getCode(client, { address: predicted })
  if (!code) throw new Error('no code at predicted address')
  return { deployed: predicted, predicted }
}

export declare namespace deployDeterministic {
  type Options = {
    bytecode: Hex.Hex
    salt: Hex.Hex
  }
}
