import { expectTypeOf, test } from 'vitest'

import {
  Actions,
  Client,
  CoinbaseSmartAccount,
  EntryPoint,
  PaymasterClient,
  Simple7702SmartAccount,
  SmartAccount,
  SoladySmartAccount,
  UserOperation,
  UserOperationGas,
  UserOperationReceipt,
  WebAuthnAccount,
  accountAbstractionActions,
  http,
} from 'viem/account-abstraction'

test('public surface', () => {
  expectTypeOf(Client.create).toBeFunction()
  expectTypeOf(PaymasterClient.create).toBeFunction()
  expectTypeOf(accountAbstractionActions).toBeFunction()
  expectTypeOf(SmartAccount.from).toBeFunction()
  expectTypeOf(CoinbaseSmartAccount.from).toBeFunction()
  expectTypeOf(Simple7702SmartAccount.from).toBeFunction()
  expectTypeOf(SoladySmartAccount.from).toBeFunction()
  expectTypeOf(WebAuthnAccount.from).toBeFunction()
  expectTypeOf(UserOperation.from).toBeFunction()
  expectTypeOf(UserOperationGas.fromRpc).toBeFunction()
  expectTypeOf(UserOperationReceipt.fromRpc).toBeFunction()
  expectTypeOf(EntryPoint.addressV08).toBeString()
  expectTypeOf(EntryPoint.addressV09).toBeString()
  expectTypeOf<EntryPoint.Version>().toEqualTypeOf<
    '0.6' | '0.7' | '0.8' | '0.9'
  >()
  expectTypeOf(http).toBeFunction()

  expectTypeOf(Actions.entryPoint.getSupported).toBeFunction()
  expectTypeOf(Actions.paymaster.getData).toBeFunction()
  expectTypeOf(Actions.paymaster.getStubData).toBeFunction()
  expectTypeOf(Actions.userOperation.prepare).toBeFunction()
  expectTypeOf(Actions.userOperation.estimateGas).toBeFunction()
  expectTypeOf(Actions.userOperation.send).toBeFunction()
  expectTypeOf(Actions.userOperation.get).toBeFunction()
  expectTypeOf(Actions.userOperation.getReceipt).toBeFunction()
  expectTypeOf(Actions.userOperation.waitForReceipt).toBeFunction()
})
