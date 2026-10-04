import type { Address } from 'abitype'
import { type Hex, RpcResponse } from 'ox'
import * as VirtualAddress from 'ox/tempo/VirtualAddress'
import type { Client } from '../../../core/Client.js'
import type { Call } from 'ox/tempo/TxEnvelopeTempo'
import * as AbiFunction from 'ox/AbiFunction'
import { validate as isAddress } from 'ox/Address'
import * as Abis from '../../Abis.js'
import * as Preflight from './preflight.js'

export async function resolveVirtualAddresses(
  client: Client,
  options: { calls: readonly Call[] },
): Promise<Record<Address, Address | null> | undefined> {
  const targets = getVirtualAddressTargets(options.calls)
  if (targets.length === 0) return undefined

  const result = await Preflight.read(client, { targets })
  return result.virtualAddresses
}

export function getVirtualAddressTargets(
  calls: readonly Call[],
): readonly Address[] {
  const targets = new Set<Address>()
  for (const call of calls) {
    for (const address of [call.to, decodeTransferRecipient(call.data)]) {
      if (!address || !isAddress(address) || !VirtualAddress.isVirtual(address))
        continue
      targets.add(address.toLowerCase() as Address)
      if (targets.size > 100)
        throw new RpcResponse.InvalidParamsError({
          message: 'Virtual-address targets exceed the limit of 100 addresses.',
        })
    }
  }

  return [...targets]
}

function decodeTransferRecipient(data?: string): Address | undefined {
  if (!data) return undefined

  const selector = data.slice(0, 10).toLowerCase()
  if (!transferSelectors.has(selector)) return undefined

  try {
    const fn = AbiFunction.fromAbi(Abis.tip20, data as Hex.Hex)
    const args = AbiFunction.decodeData(fn, data as Hex.Hex)
    const functionName = fn.name

    if (
      (functionName === 'transfer' || functionName === 'transferWithMemo') &&
      typeof args[0] === 'string' &&
      isAddress(args[0], { strict: false })
    )
      return args[0]

    if (
      (functionName === 'transferFrom' ||
        functionName === 'transferFromWithMemo') &&
      typeof args[1] === 'string'
    )
      return args[1]
  } catch {}

  return undefined
}

const transferSelectors = new Set([
  '0xa9059cbb',
  '0x95777d59',
  '0x23b872dd',
  '0x929c2539',
])

export function extractCalls(
  transaction: Record<string, unknown>,
): readonly Call[] {
  const calls = transaction.calls as readonly Call[] | undefined
  if (calls && calls.length > 0)
    return calls.map((c) => ({
      ...(c.to ? { to: c.to } : {}),
      ...(c.data ? { data: c.data } : {}),
      ...(c.value ? { value: c.value } : {}),
    })) as readonly Call[]

  return [
    {
      ...(transaction.to ? { to: transaction.to as Address } : {}),
      ...(transaction.data ? { data: transaction.data as `0x${string}` } : {}),
      ...(transaction.value ? { value: transaction.value as bigint } : {}),
    },
  ] as readonly Call[]
}
