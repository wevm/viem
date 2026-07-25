import { Actions, Client, ContractError, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi, AbiFunction } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const abi = Abi.from(['function buyBeans()'])
const address = '0x1111111111111111111111111111111111111111'

export async function example(): Promise<string> {
  const functionName = 'buyBeans'
  const data = AbiFunction.encodeData(abi, functionName)
  try {
    await Actions.call(client, { data, to: address })
  } catch (error) {
    if (error instanceof Error) {
      const execution = ContractError.fromError(error, {
        abi,
        address,
        functionName,
      })
      const revert = execution.cause
      if (
        revert instanceof ContractError.ContractFunctionRevertedError &&
        revert.reason
      )
        return revert.reason
    }
    throw error
  }
  throw new Error('call did not revert')
}
