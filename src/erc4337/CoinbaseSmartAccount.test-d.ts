import type { AbiFunction, Hex } from 'ox'
import { EntryPoint } from 'ox/erc4337'
import { expectTypeOf, test } from 'vitest'

import { Account } from 'viem'
import * as anvil from '~test/anvil.js'
import * as CoinbaseSmartAccount from './CoinbaseSmartAccount.js'
import * as SmartAccount from './SmartAccount.js'
import type * as WebAuthnAccount from './WebAuthnAccount.js'

const client = anvil.getClient(anvil.mainnet)
const owner = Account.fromPrivateKey(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('default', async () => {
  const account = await CoinbaseSmartAccount.from({
    client,
    owners: [owner],
    version: '1',
  })

  expectTypeOf(account).toEqualTypeOf<
    CoinbaseSmartAccount.Account<Hex.Hex, '1'>
  >()
  expectTypeOf(account).toExtend<SmartAccount.SmartAccount>()
  expectTypeOf(account.address).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof EntryPoint.abiV06>()
  expectTypeOf(account.entryPoint.address).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.6'>()
  expectTypeOf(
    account.factory.address,
  ).toEqualTypeOf<'0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a'>()
  expectTypeOf(account.type).toEqualTypeOf<'smart'>()
})

test('literal address and version', async () => {
  const account = await CoinbaseSmartAccount.from({
    address: '0x0000000000000000000000000000000000000001',
    client,
    nonce: 1n,
    ownerIndex: 0,
    owners: [owner.address, owner] as const,
    version: '1.1',
  })

  expectTypeOf(
    account.address,
  ).toEqualTypeOf<'0x0000000000000000000000000000000000000001'>()
  expectTypeOf(
    account.factory.address,
  ).toEqualTypeOf<'0xba5ed110efdba3d005bfc882d75358acbbb85842'>()
  expectTypeOf(account).toEqualTypeOf<
    CoinbaseSmartAccount.Account<
      '0x0000000000000000000000000000000000000001',
      '1.1'
    >
  >()
})

test('owner types', () => {
  const webAuthnOwner = {} as WebAuthnAccount.Account<'credential'>

  CoinbaseSmartAccount.from({
    client,
    owners: [owner.address, owner, webAuthnOwner],
    version: '1',
  })
  CoinbaseSmartAccount.from({
    client,
    // @ts-expect-error JSON-RPC accounts cannot sign.
    owners: [Account.from(owner.address)],
    version: '1',
  })
})

test('abi surface', async () => {
  const account = await CoinbaseSmartAccount.from({
    client,
    owners: [owner],
    version: '1',
  })

  type Name = AbiFunction.Name<typeof account.abi>
  expectTypeOf<Name>().toEqualTypeOf<
    | 'REPLAYABLE_NONCE_KEY'
    | 'addOwnerAddress'
    | 'addOwnerPublicKey'
    | 'canSkipChainIdValidation'
    | 'domainSeparator'
    | 'eip712Domain'
    | 'entryPoint'
    | 'execute'
    | 'executeBatch'
    | 'executeWithoutChainIdValidation'
    | 'getUserOpHashWithoutChainId'
    | 'implementation'
    | 'initialize'
    | 'isOwnerAddress'
    | 'isOwnerBytes'
    | 'isOwnerPublicKey'
    | 'isValidSignature'
    | 'nextOwnerIndex'
    | 'ownerAtIndex'
    | 'ownerCount'
    | 'proxiableUUID'
    | 'removeLastOwner'
    | 'removeOwnerAtIndex'
    | 'removedOwnersCount'
    | 'replaySafeHash'
    | 'upgradeToAndCall'
    | 'validateUserOp'
  >()

  type FactoryName = AbiFunction.Name<typeof account.factory.abi>
  expectTypeOf<FactoryName>().toEqualTypeOf<
    'createAccount' | 'getAddress' | 'implementation' | 'initCodeHash'
  >()
})

test('signatures and calls', async () => {
  const account = await CoinbaseSmartAccount.from({
    client,
    owners: [owner],
    version: '1',
  })

  expectTypeOf(account.decodeCalls('0x')).toEqualTypeOf<
    readonly SmartAccount.Call[] | Promise<readonly SmartAccount.Call[]>
  >()
  expectTypeOf(account.sign({ hash: '0x' })).toEqualTypeOf<Promise<Hex.Hex>>()
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

test('version is required and constrained', () => {
  // @ts-expect-error `version` is required.
  CoinbaseSmartAccount.from({ client, owners: [owner] })
  CoinbaseSmartAccount.from({
    client,
    owners: [owner],
    // @ts-expect-error unsupported Coinbase Smart Account version.
    version: '2',
  })
})
