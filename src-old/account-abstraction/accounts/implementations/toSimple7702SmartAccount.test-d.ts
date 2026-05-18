import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import type { Account } from '../../../types/account.js'
import type { entryPoint08Abi, entryPoint09Abi } from '../../constants/abis.js'
import type { SmartAccount } from '../types.js'
import {
  type Simple7702SmartAccountImplementation,
  toSimple7702SmartAccount,
} from './toSimple7702SmartAccount.js'

const client = anvilMainnet.getClient()
const owner = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('default', async () => {
  const account = await toSimple7702SmartAccount({
    client,
    owner,
  })

  expectTypeOf(account).toExtend<Account>()
  expectTypeOf(account).toExtend<SmartAccount>()
  expectTypeOf(account).toExtend<
    SmartAccount<Simple7702SmartAccountImplementation<'0.8'>>
  >()
  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof entryPoint08Abi>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.8'>()
})

test('entryPoint: 0.8', async () => {
  const account = await toSimple7702SmartAccount({
    client,
    owner,
    entryPoint: '0.8',
  })

  expectTypeOf(account).toExtend<Account>()
  expectTypeOf(account).toExtend<SmartAccount>()
  expectTypeOf(account).toExtend<
    SmartAccount<Simple7702SmartAccountImplementation<'0.8'>>
  >()
  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof entryPoint08Abi>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.8'>()
})

test('entryPoint: 0.9', async () => {
  const account = await toSimple7702SmartAccount({
    client,
    owner,
    entryPoint: '0.9',
  })

  expectTypeOf(account).toExtend<Account>()
  expectTypeOf(account).toExtend<SmartAccount>()
  expectTypeOf(account).toExtend<
    SmartAccount<Simple7702SmartAccountImplementation<'0.9'>>
  >()
  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof entryPoint09Abi>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.9'>()
})

test('entryPoint: custom', async () => {
  const customAbi = [
    {
      type: 'function',
      name: 'customFunction',
      inputs: [],
      outputs: [],
      stateMutability: 'view',
    },
  ] as const

  const account = await toSimple7702SmartAccount({
    client,
    owner,
    entryPoint: {
      abi: customAbi,
      address: '0x0000000000000000000000000000000000000001',
      version: '0.6',
    },
  })

  expectTypeOf(account).toExtend<Account>()
  expectTypeOf(account).toExtend<SmartAccount>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.6'>()
  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof customAbi>()
})
