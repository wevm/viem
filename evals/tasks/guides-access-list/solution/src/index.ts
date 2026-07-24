import { Actions, type Client } from 'viem'
import { type Abi, AbiFunction } from 'viem/utils'

export async function buildAccessList<
  const abi extends Abi.Abi,
  functionName extends buildAccessList.FunctionName<abi>,
>(client: Client.Client, options: buildAccessList.Options<abi, functionName>) {
  // Viem's public options enforce the generic contract before encoding.
  const {
    abi,
    address,
    args = [],
    functionName,
  } = options as Actions.contract.read.Options
  return Actions.transaction.createAccessList(client, {
    data: AbiFunction.encodeData(AbiFunction.fromAbi(abi, functionName), args),
    to: address,
  })
}

export declare namespace buildAccessList {
  type FunctionName<abi extends Abi.Abi> =
    Actions.contract.read.Options<abi>['functionName']

  type Options<
    abi extends Abi.Abi,
    functionName extends FunctionName<abi>,
  > = Actions.contract.read.Options<abi, functionName>
}
