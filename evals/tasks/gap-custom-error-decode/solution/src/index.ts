import { Actions, type Client, ContractError } from 'viem'
import { type Abi, type AbiError, AbiFunction, type Address } from 'viem/utils'

export async function getRevertError<
  const abi extends Abi.Abi,
  functionName extends getRevertError.FunctionName<abi>,
>(
  client: Client.Client,
  options: getRevertError.Options<abi, functionName>,
): Promise<getRevertError.ReturnType<abi>> {
  const { abi, address, functionName } = options
  // Runtime ABI lookup cannot retain the filtered no-argument name.
  const abiFunction = AbiFunction.fromAbi(
    abi as Abi.Abi,
    functionName as string,
  )
  const data = AbiFunction.encodeData(abiFunction)
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
        revert.data
      ) {
        // ContractError decoded these arguments against the same ABI.
        return {
          errorName: revert.data.name,
          args: revert.data.args ?? [],
        } as getRevertError.ReturnType<abi>
      }
    }
    throw error
  }
  throw new Error('expected the contract function to revert')
}

export declare namespace getRevertError {
  type FunctionName<abi extends Abi.Abi> = {
    [name in AbiFunction.Name<abi>]: AbiFunction.FromAbi<
      abi,
      name
    >['inputs'] extends readonly []
      ? name
      : never
  }[AbiFunction.Name<abi>]

  type ReturnType<abi extends Abi.Abi> = {
    [name in ErrorName<abi>]: {
      args: ToArgs<AbiError.decode.ReturnType<AbiError.FromAbi<abi, name>>>
      errorName: name
    }
  }[ErrorName<abi>]

  type ErrorName<abi extends Abi.Abi> = Extract<
    abi[number],
    { name: string; type: 'error' }
  >['name']

  type ToArgs<args> = args extends undefined
    ? readonly []
    : args extends readonly unknown[]
      ? args
      : readonly [args]

  type Options<abi extends Abi.Abi, functionName extends FunctionName<abi>> = {
    abi: abi
    address: Address.Address
    functionName: functionName
  }
}
