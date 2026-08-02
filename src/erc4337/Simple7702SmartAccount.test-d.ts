import type { AbiFunction, Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Account } from 'viem'
import * as anvil from '~test/anvil.js'
import * as EntryPoint from './EntryPoint.js'
import * as SmartAccount from './SmartAccount.js'
import * as Simple7702SmartAccount from './Simple7702SmartAccount.js'

const client = anvil.getClient(anvil.mainnet)
const owner = Account.fromPrivateKey(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('default', async () => {
  const account = await Simple7702SmartAccount.from({ client, owner })

  expectTypeOf(account).toEqualTypeOf<Simple7702SmartAccount.Account>()
  expectTypeOf(account).toExtend<SmartAccount.SmartAccount>()
  expectTypeOf(account.address).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof EntryPoint.abiV08>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.8'>()
  expectTypeOf(account.owner).toEqualTypeOf<Account.PrivateKey>()
  expectTypeOf(
    account.authorization.account,
  ).toEqualTypeOf<Account.PrivateKey>()
  expectTypeOf(account.authorization.address).toEqualTypeOf<`0x${string}`>()
})

test('abi surface', async () => {
  const account = await Simple7702SmartAccount.from({ client, owner })

  type Name = AbiFunction.Name<typeof account.abi>
  expectTypeOf<Name>().toEqualTypeOf<
    | 'entryPoint'
    | 'execute'
    | 'executeBatch'
    | 'getNonce'
    | 'isValidSignature'
    | 'onERC1155BatchReceived'
    | 'onERC1155Received'
    | 'onERC721Received'
    | 'supportsInterface'
    | 'validateUserOp'
  >()
})

test('options', async () => {
  const account = await Simple7702SmartAccount.from({
    client,
    getNonce(options = {}) {
      expectTypeOf(options).toEqualTypeOf<SmartAccount.getNonce.Options>()
      return options.key ?? 0n
    },
    implementation: '0x0000000000000000000000000000000000000001',
    owner,
  })

  expectTypeOf(account.getNonce({ key: 1n })).toEqualTypeOf<Promise<bigint>>()
})

test('EntryPoint 0.9', async () => {
  const account = await Simple7702SmartAccount.from({
    client,
    entryPoint: '0.9',
    owner,
  })

  expectTypeOf(account).toEqualTypeOf<Simple7702SmartAccount.Account<'0.9'>>()
  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof EntryPoint.abiV09>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.9'>()
})

test('custom EntryPoint', async () => {
  const abi = [] as const
  const account = await Simple7702SmartAccount.from({
    client,
    entryPoint: {
      abi,
      address: '0x0000000000000000000000000000000000000001',
      version: '0.9',
    },
    owner,
  })

  expectTypeOf(account.entryPoint.abi).toEqualTypeOf<typeof abi>()
  expectTypeOf(account.entryPoint.version).toEqualTypeOf<'0.9'>()
})

test('signUserOperation', async () => {
  const account = await Simple7702SmartAccount.from({ client, owner })

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

test('entryPoint supports 0.8 and 0.9', () => {
  Simple7702SmartAccount.from({
    client,
    // @ts-expect-error Simple7702 supports EntryPoint 0.8 and 0.9.
    entryPoint: '0.7',
    owner,
  })
})

test('owner must sign EIP-7702 authorizations', () => {
  Simple7702SmartAccount.from({
    client,
    // @ts-expect-error JSON-RPC accounts cannot sign EIP-7702 authorizations.
    owner: Account.from(owner.address),
  })
})
