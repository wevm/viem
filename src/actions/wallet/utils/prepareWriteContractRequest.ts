import type { Abi } from 'abitype'

import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { Chain } from '../../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../../types/contract.js'
import {
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import type { WriteContractParameters } from '../writeContract.js'

/** @internal */
export function prepareWriteContractRequest<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WriteContractParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
  options: prepareWriteContractRequest.Options = {},
) {
  const {
    abi,
    account: account_ = client.account,
    address,
    args,
    functionName,
    ...request
  } = parameters as WriteContractParameters

  if (typeof account_ === 'undefined')
    throw new AccountNotFoundError({
      docsPath: options.docsPath ?? '/docs/contract/writeContract',
    })
  const account = account_ ? parseAccount(account_) : null

  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as EncodeFunctionDataParameters)

  return {
    abi,
    account,
    address,
    args,
    functionName,
    request: {
      data,
      to: address,
      account,
      ...request,
    },
  }
}

export declare namespace prepareWriteContractRequest {
  export type Options = {
    docsPath?: string | undefined
  }
}
