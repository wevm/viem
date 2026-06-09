import { describe, expect, test } from 'vitest'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { accountConfigurationAbi } from '../abis.js'
import {
  eip8130ChainIds,
  is8130Enabled,
  register8130Chains,
  unregister8130Chains,
} from '../chains.js'
import { accountConfigAddress } from '../constants.js'
import type { AaActor, AaActorChange } from '../types/transaction.js'
import {
  encodeApplySignedActorChangesData,
  encodeCreateAccountData,
  toFactoryArgs8130,
} from './accountConfigCalls.js'
import { computeAddress8130 } from './computeAddress.js'

const actor: AaActor = {
  actorId: '0x0000000000000000000000000000000000000000000000000000000000000001',
  authenticator: '0x0000000000000000000000000000000000000001',
}

describe('is8130Enabled (routing)', () => {
  test('default registry is empty; register/unregister works', () => {
    expect(is8130Enabled(8453)).toBe(false)
    register8130Chains(8453)
    expect(is8130Enabled(8453)).toBe(true)
    expect(is8130Enabled({ id: 8453 })).toBe(true)
    unregister8130Chains(8453)
    expect(is8130Enabled(8453)).toBe(false)
    expect(eip8130ChainIds.has(8453)).toBe(false)
  })

  test('accepts an explicit chainIds set without touching the registry', () => {
    expect(is8130Enabled(10, { chainIds: [10, 8453] })).toBe(true)
    expect(is8130Enabled(1, { chainIds: [10, 8453] })).toBe(false)
    expect(eip8130ChainIds.has(10)).toBe(false)
  })
})

describe('toFactoryArgs8130 (ERC-4337 factory)', () => {
  const params = {
    userSalt:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    code: '0x6080',
    initialActors: [actor],
  } as const

  test('factory is the account config contract; factoryData is createAccount', () => {
    const { factory, factoryData } = toFactoryArgs8130(params)
    expect(factory).toBe(accountConfigAddress)
    expect(factoryData).toBe(encodeCreateAccountData(params))

    const { functionName, args } = decodeFunctionData({
      abi: accountConfigurationAbi,
      data: factoryData,
    })
    expect(functionName).toBe('createAccount')
    expect(args[0]).toBe(params.userSalt)
    expect(args[1]).toBe(params.code)
    expect(args[2]).toEqual([
      { actorId: actor.actorId, authenticator: actor.authenticator },
    ])
  })

  test('custom factory address', () => {
    const factoryAddress = '0x00000000000000000000000000000000000000aa' as const
    const { factory } = toFactoryArgs8130({
      ...params,
      accountConfigAddress: factoryAddress,
    })
    expect(factory).toBe(factoryAddress)
  })

  test('factory deploys to the computeAddress8130 address', () => {
    // both derive from the same inputs/config address -> portable address
    const address = computeAddress8130(params)
    expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/)
  })
})

describe('encodeApplySignedActorChangesData (portable path)', () => {
  test('encodes account, chainId, actorChanges, auth', () => {
    const actorChanges: readonly AaActorChange[] = [
      {
        changeType: 0x01,
        actorId:
          '0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc',
        authenticator: '0x0000000000000000000000000000000000000001',
        scope: 0x04,
      },
      {
        changeType: 0x02,
        actorId:
          '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      },
    ]
    const data = encodeApplySignedActorChangesData({
      account: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      chainId: 0,
      actorChanges,
      auth: '0xfeed',
    })
    const decoded = decodeFunctionData({
      abi: accountConfigurationAbi,
      data,
    })
    expect(decoded.functionName).toBe('applySignedActorChanges')
    expect(decoded.args[1]).toBe(0n)
    expect((decoded.args[2] as readonly { changeType: number }[]).length).toBe(
      2,
    )
    expect(decoded.args[3]).toBe('0xfeed')
  })
})
