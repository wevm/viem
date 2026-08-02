import { EntryPoint } from 'ox/erc4337'
import { expectTypeOf, test } from 'vitest'

import type * as Client from '../core/Client.js'
import * as SmartAccount from './SmartAccount.js'

declare const client: Client.Client

test('from', async () => {
  const account = await SmartAccount.from({
    client,
    encodeCalls() {
      return '0x' as const
    },
    entryPoint: {
      abi: EntryPoint.abiV07,
      address: EntryPoint.addressV07,
      version: '0.7',
    },
    extend: { label: 'test' as const },
    getAddress() {
      return '0x0000000000000000000000000000000000000000' as const
    },
    getFactoryArgs() {
      return { factory: undefined, factoryData: undefined }
    },
    getStubSignature() {
      return '0x' as const
    },
    signMessage() {
      return '0x' as const
    },
    signTypedData() {
      return '0x' as const
    },
    signUserOperation() {
      return '0x' as const
    },
  })

  expectTypeOf(account).toMatchTypeOf<SmartAccount.SmartAccount>()
  expectTypeOf(
    account.address,
  ).toEqualTypeOf<'0x0000000000000000000000000000000000000000'>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.7'>()
  expectTypeOf(account.label).toEqualTypeOf<'test'>()
  expectTypeOf(account.type).toEqualTypeOf<'smart'>()
})
