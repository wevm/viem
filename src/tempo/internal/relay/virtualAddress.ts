import type { Address } from 'abitype'
import type { Hex } from 'ox'
import * as VirtualAddress from 'ox/tempo/VirtualAddress'
import type { Client } from '../../../clients/createClient.js'
import type { Call } from '../../../types/calls.js'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { isAddress } from '../../../utils/address/isAddress.js'
import * as Abis from '../../Abis.js'
import * as Actions from '../../actions/index.js'

export async function resolveVirtualAddresses(
  client: Client,
  options: { calls: readonly Call[] },
): Promise<Record<Address, Address | null> | undefined> {
  const targets = getVirtualAddressTargets(options.calls)
  if (targets.length === 0) return undefined

  const masters = new Map<string, { addresses: Address[]; masterId: Hex.Hex }>()
  for (const address of targets) {
    const { masterId } = VirtualAddress.parse(address)
    const lower = masterId.toLowerCase()
    const entry = masters.get(lower) ?? { addresses: [] as Address[], masterId }
    entry.addresses.push(address)
    masters.set(lower, entry)
  }

  const entries = await Promise.all(
    [...masters.values()].map(async ({ addresses, masterId }) => {
      const master = await Actions.virtualAddress.getMasterAddress(client, {
        masterId,
      })
      return addresses.map((address) => [address, master] as const)
    }),
  )

  return Object.fromEntries(entries.flat()) as Record<Address, Address | null>
}

function getVirtualAddressTargets(calls: readonly Call[]): readonly Address[] {
  const targets = new Set<Address>()
  for (const call of calls) {
    for (const address of [call.to, decodeTransferRecipient(call.data)]) {
      if (!address || !isAddress(address) || !VirtualAddress.isVirtual(address))
        continue
      targets.add(address.toLowerCase() as Address)
    }
  }

  return [...targets]
}

function decodeTransferRecipient(data?: string): Address | undefined {
  if (!data) return undefined

  const selector = data.slice(0, 10).toLowerCase()
  if (!transferSelectors.has(selector)) return undefined

  try {
    const { args, functionName } = decodeFunctionData({
      abi: Abis.tip20,
      data: data as Hex.Hex,
    })

    if (
      (functionName === 'transfer' || functionName === 'transferWithMemo') &&
      typeof args[0] === 'string'
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
