import type { Address } from 'abitype'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { ChainNotFoundError } from '../../../errors/chain.js'
import type { Account } from '../../../types/account.js'
import type { Call } from '../../../types/calls.js'
import type { Chain } from '../../../types/chain.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { concat } from '../../../utils/data/concat.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import type { SendCallsParameters } from '../sendCalls.js'

/** @internal */
export function prepareSendCallsRequest<
  const calls extends readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: SendCallsParameters<chain, account, chainOverride, calls>,
) {
  const {
    account: account_ = client.account,
    chain = client.chain,
    experimental_fallback,
    experimental_fallbackDelay = 32,
    forceAtomic = false,
    id,
    version = '2.0.0',
  } = parameters

  const account = account_ ? parseAccount(account_) : null
  if (!chain) throw new ChainNotFoundError()

  let capabilities = parameters.capabilities

  if (client.dataSuffix && !parameters.capabilities?.dataSuffix) {
    if (typeof client.dataSuffix === 'string')
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: { value: client.dataSuffix, optional: true },
      }
    else
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: {
          value: client.dataSuffix.value,
          ...(client.dataSuffix.required ? {} : { optional: true }),
        },
      }
  }

  const preparedCalls = parameters.calls.map((call_: unknown) => {
    const call = call_ as Call

    const data = call.abi
      ? encodeFunctionData({
          abi: call.abi,
          functionName: call.functionName,
          args: call.args,
        })
      : call.data

    return {
      data: call.dataSuffix && data ? concat([data, call.dataSuffix]) : data,
      to: call.to,
      value: call.value ? numberToHex(call.value) : undefined,
    }
  })

  return {
    calls: preparedCalls,
    capabilities,
    chain,
    experimental_fallback,
    experimental_fallbackDelay,
    forceAtomic,
    account,
    request: {
      atomicRequired: forceAtomic,
      calls: preparedCalls,
      capabilities,
      chainId: numberToHex(chain.id),
      from: account?.address as Address | undefined,
      id,
      version,
    },
  }
}
