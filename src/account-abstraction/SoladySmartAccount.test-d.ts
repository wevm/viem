import type { AbiFunction, Hex } from 'ox'
import { EntryPoint } from 'ox/erc4337'
import { expectTypeOf, test } from 'vitest'

import { Account } from 'viem'
import * as anvil from '~test/anvil.js'
import * as SmartAccount from './SmartAccount.js'
import * as SoladySmartAccount from './SoladySmartAccount.js'

const client = anvil.getClient(anvil.mainnet)
const owner = Account.fromPrivateKey(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('default EntryPoint 0.7', async () => {
  const account = await SoladySmartAccount.from({ client, owner })

  expectTypeOf(account).toExtend<SmartAccount.SmartAccount>()
  expectTypeOf(account.address).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof EntryPoint.abiV07>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.7'>()
  expectTypeOf(
    account.factory.address,
  ).toEqualTypeOf<'0x5d82735936c6Cd5DE57cC3c1A799f6B2E6F933Df'>()
  expectTypeOf(account.decodeCalls).toBeFunction()
})

test('custom EntryPoint 0.6', async () => {
  const account = await SoladySmartAccount.from({
    client,
    entryPoint: {
      abi: EntryPoint.abiV06,
      address: EntryPoint.addressV06,
      version: '0.6',
    },
    factoryAddress: '0x0000000000000000000000000000000000000006',
    owner,
  })

  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof EntryPoint.abiV06>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.6'>()
  expectTypeOf(
    account.factory.address,
  ).toEqualTypeOf<'0x0000000000000000000000000000000000000006'>()
  expectTypeOf(
    account.signUserOperation({
      callData: '0x',
      callGasLimit: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      nonce: 0n,
      preVerificationGas: 0n,
      verificationGasLimit: 0n,
    }),
  ).toEqualTypeOf<Hex.Hex | Promise<Hex.Hex>>()
})

test('explicit EntryPoint requires a factory', () => {
  const entryPoint06 = {
    abi: EntryPoint.abiV06,
    address: EntryPoint.addressV06,
    version: '0.6',
  } as const
  const entryPoint07 = {
    abi: EntryPoint.abiV07,
    address: EntryPoint.addressV07,
    version: '0.7',
  } as const

  // @ts-expect-error Explicit EntryPoints require a compatible factory.
  SoladySmartAccount.from({
    client,
    entryPoint: entryPoint06,
    owner,
  })

  // @ts-expect-error Explicit EntryPoints require a compatible factory.
  SoladySmartAccount.from({
    client,
    entryPoint: entryPoint07,
    owner,
  })
})

test('literal address and factory', async () => {
  const account = await SoladySmartAccount.from({
    address: '0x0000000000000000000000000000000000000001',
    client,
    factoryAddress: '0x0000000000000000000000000000000000000002',
    owner,
  })

  expectTypeOf(
    account.address,
  ).toEqualTypeOf<'0x0000000000000000000000000000000000000001'>()
  expectTypeOf(
    account.factory.address,
  ).toEqualTypeOf<'0x0000000000000000000000000000000000000002'>()
})

test('account compatibility', async () => {
  const account = await SoladySmartAccount.from({ client, owner })

  expectTypeOf(account).toExtend<SoladySmartAccount.Account>()
  expectTypeOf(account).toExtend<SmartAccount.SmartAccount>()
})

test('abi surface', async () => {
  const account = await SoladySmartAccount.from({ client, owner })

  type Name = AbiFunction.Name<typeof account.abi>
  expectTypeOf<Name>().toEqualTypeOf<
    | 'addDeposit'
    | 'cancelOwnershipHandover'
    | 'completeOwnershipHandover'
    | 'delegateExecute'
    | 'eip712Domain'
    | 'entryPoint'
    | 'execute'
    | 'executeBatch'
    | 'getDeposit'
    | 'initialize'
    | 'isValidSignature'
    | 'owner'
    | 'ownershipHandoverExpiresAt'
    | 'proxiableUUID'
    | 'renounceOwnership'
    | 'requestOwnershipHandover'
    | 'storageLoad'
    | 'storageStore'
    | 'transferOwnership'
    | 'upgradeToAndCall'
    | 'validateUserOp'
    | 'withdrawDepositTo'
  >()
})

test('nonce override', async () => {
  const account = await SoladySmartAccount.from({
    client,
    getNonce(options = {}) {
      expectTypeOf(options).toEqualTypeOf<SmartAccount.getNonce.Options>()
      return options.key ?? 0n
    },
    owner,
  })

  expectTypeOf(account.getNonce({ key: 1n })).toEqualTypeOf<Promise<bigint>>()
})

test('owner inputs', () => {
  SoladySmartAccount.from({ client, owner: owner.address })
  SoladySmartAccount.from({ client, owner: Account.from(owner.address) })
  SoladySmartAccount.from({ client, owner })
})

test('EntryPoint 0.8 is unsupported', () => {
  SoladySmartAccount.from({
    client,
    entryPoint: {
      abi: EntryPoint.abiV08,
      address: EntryPoint.addressV08,
      // @ts-expect-error Solady supports EntryPoint 0.6 and 0.7.
      version: '0.8',
    },
    owner,
  })
})
