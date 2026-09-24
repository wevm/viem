import { describe, expect, test } from 'vitest'
import { mainnet } from '../chains/index.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import { encodeAbiParameters } from '../utils/abi/encodeAbiParameters.js'
import { encodeFunctionResult } from '../utils/abi/encodeFunctionResult.js'
import { keystoreAbi } from './abis.js'
import { getLockStatus } from './actions/getLockStatus.js'
import { isLocked } from './actions/isLocked.js'
import { changeType } from './constants.js'
import { lockChange, unlockChange } from './lock.js'
import { encodeChangePayload } from './utils/actorChangeData.js'

const account = '0x0000000000000000000000000000000000000a11'

describe('lockChange', () => {
  test('builds a Lock op with an abi.encode(uint16 unlockDelay) payload', () => {
    const change = lockChange({ unlockDelay: 3600 })
    expect(change).toEqual({ changeType: changeType.lock, unlockDelay: 3600 })
    expect(encodeChangePayload(change)).toBe(
      encodeAbiParameters([{ type: 'uint16' }], [3600]),
    )
  })

  test('rejects out-of-range unlockDelay (uint16)', () => {
    expect(() => lockChange({ unlockDelay: 0 })).toThrow()
    expect(() => lockChange({ unlockDelay: -1 })).toThrow()
    expect(() => lockChange({ unlockDelay: 65_536 })).toThrow()
    expect(() => lockChange({ unlockDelay: 1.5 })).toThrow()
  })
})

describe('unlockChange', () => {
  test('builds an Unlock op with an empty payload', () => {
    const change = unlockChange()
    expect(change).toEqual({ changeType: changeType.unlock })
    expect(encodeChangePayload(change)).toBe('0x')
  })
})

function lockClient(handlers: Record<string, `0x${string}`>) {
  return createClient({
    chain: mainnet,
    transport: custom({
      async request({ method }: { method: string; params: any }) {
        if (method === 'eth_chainId') return '0x1'
        if (method === 'eth_call') return handlers.eth_call
        throw new Error(`unexpected RPC: ${method}`)
      },
    }),
  })
}

describe('getLockStatus', () => {
  test('decodes the Keystore.getLockStatus tuple', async () => {
    const client = lockClient({
      eth_call: encodeFunctionResult({
        abi: keystoreAbi,
        functionName: 'getLockStatus',
        result: [true, true, 1_800_000_000, 3600],
      }),
    })
    const status = await getLockStatus(client, { account })
    expect(status).toEqual({
      locked: true,
      hasInitiatedUnlock: true,
      unlocksAt: 1_800_000_000,
      unlockDelay: 3600,
    })
  })
})

describe('isLocked', () => {
  test('decodes the Keystore.isLocked bool', async () => {
    const client = lockClient({
      eth_call: encodeFunctionResult({
        abi: keystoreAbi,
        functionName: 'isLocked',
        result: true,
      }),
    })
    expect(await isLocked(client, { account })).toBe(true)
  })
})
