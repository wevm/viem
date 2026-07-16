import { describe, expect, test } from 'vitest'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import { encodeFunctionResult } from '../../utils/abi/encodeFunctionResult.js'
import { accountConfigurationAbi } from './abis.js'
import { getLockStatus8130 } from './actions/getLockStatus8130.js'
import { isLocked8130 } from './actions/isLocked8130.js'
import { accountConfigAddress, lockOp, unlockOp } from './constants.js'
import { initiateUnlockCall, lockCall } from './lock.js'

const account = '0x0000000000000000000000000000000000000a11'
// Signed-lock-change `auth` blob (authenticator || data); opaque to the call builder.
const auth = `0x${'ab'.repeat(85)}` as const

describe('lockCall', () => {
  test('encodes applySignedLockChanges(LOCK_OP) to the canonical AccountConfiguration', () => {
    const call = lockCall({ account, unlockDelay: 3600, auth })
    expect(call.to).toBe(accountConfigAddress)
    const { functionName, args } = decodeFunctionData({
      abi: accountConfigurationAbi,
      data: call.data!,
    })
    expect(functionName).toBe('applySignedLockChanges')
    expect(args).toEqual([account, lockOp, 3600, auth])
  })

  test('respects an accountConfiguration override', () => {
    const accountConfiguration = '0x00000000000000000000000000000000000000cc'
    expect(
      lockCall({ account, unlockDelay: 3600, auth, accountConfiguration }).to,
    ).toBe(accountConfiguration)
  })

  test('rejects out-of-range unlockDelay (uint16)', () => {
    expect(() => lockCall({ account, unlockDelay: 0, auth })).toThrow()
    expect(() => lockCall({ account, unlockDelay: -1, auth })).toThrow()
    expect(() => lockCall({ account, unlockDelay: 65_536, auth })).toThrow()
    expect(() => lockCall({ account, unlockDelay: 1.5, auth })).toThrow()
  })
})

describe('initiateUnlockCall', () => {
  test('encodes applySignedLockChanges(UNLOCK_OP) to the canonical AccountConfiguration', () => {
    const call = initiateUnlockCall({ account, auth })
    expect(call.to).toBe(accountConfigAddress)
    const { functionName, args } = decodeFunctionData({
      abi: accountConfigurationAbi,
      data: call.data!,
    })
    expect(functionName).toBe('applySignedLockChanges')
    expect(args).toEqual([account, unlockOp, 0, auth])
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

describe('getLockStatus8130', () => {
  test('decodes the AccountConfiguration.getLockStatus tuple', async () => {
    const client = lockClient({
      eth_call: encodeFunctionResult({
        abi: accountConfigurationAbi,
        functionName: 'getLockStatus',
        result: [true, true, 1_800_000_000, 3600],
      }),
    })
    const status = await getLockStatus8130(client, { account })
    expect(status).toEqual({
      locked: true,
      hasInitiatedUnlock: true,
      unlocksAt: 1_800_000_000,
      unlockDelay: 3600,
    })
  })
})

describe('isLocked8130', () => {
  test('decodes the AccountConfiguration.isLocked bool', async () => {
    const client = lockClient({
      eth_call: encodeFunctionResult({
        abi: accountConfigurationAbi,
        functionName: 'isLocked',
        result: true,
      }),
    })
    expect(await isLocked8130(client, { account })).toBe(true)
  })
})
