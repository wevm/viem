import { Actions, type Client, ContractError } from 'viem'
import { type Abi, AbiFunction, type Address } from 'viem/utils'

export async function getRevertReason<const abi extends Abi.Abi>(
  client: Client.Client,
  options: getRevertReason.Options<abi>,
): Promise<string> {
  const { abi, address, functionName } = options
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

export declare namespace getRevertReason {
  type FunctionName<abi extends Abi.Abi> = {
    [name in AbiFunction.Name<abi>]: AbiFunction.FromAbi<
      abi,
      name
    >['inputs'] extends readonly []
      ? name
      : never
  }[AbiFunction.Name<abi>]

  type Options<abi extends Abi.Abi> = {
    abi: abi
    address: Address.Address
    functionName: FunctionName<abi>
  }
}
