import type { Address } from 'abitype'

import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import type { Account } from '../../accounts/types.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import type { Chain } from '../../types/chain.js'

import type {
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedEIP4844,
  TransactionSerializedEIP7702,
  TransactionSerializedLegacy,
} from '~viem/index.js'
import { signTransaction } from './signTransaction.js'

const walletClient = createWalletClient({
  account: '0x',
  chain: anvilMainnet.chain,
  transport: http(anvilMainnet.rpcUrl.http),
})
const walletClientWithoutAccount = createWalletClient({
  chain: anvilMainnet.chain,
  transport: http(anvilMainnet.rpcUrl.http),
})
const walletClientWithoutChain = createWalletClient({
  account: '0x',
  transport: http(anvilMainnet.rpcUrl.http),
})

test('with and without `account`', () => {
  signTransaction(walletClient, {
    account: '0x' as Account | Address | undefined,
    // ^?
  })
  signTransaction(walletClientWithoutAccount, {
    account: '0x' as Account | Address,
    // ^?
  })
})

test('with and without `chain`', () => {
  signTransaction(walletClient, {
    chain: anvilMainnet.chain as Chain | undefined,
    // ^?
  })
  signTransaction(walletClientWithoutChain, {
    chain: anvilMainnet.chain as Chain,
    // ^?
  })
})

test('legacy', () => {
  const signature1 = signTransaction(walletClient, {
    gasPrice: 0n,
  })
  const signature2 = signTransaction(walletClient, {
    type: 'legacy',
  })

  expectTypeOf(signature1).toEqualTypeOf<Promise<TransactionSerializedLegacy>>()
  expectTypeOf(signature2).toEqualTypeOf<Promise<TransactionSerializedLegacy>>()

  // @ts-expect-error
  signTransaction(walletClient, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  signTransaction(walletClient, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  signTransaction(walletClient, {
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip7702', () => {
  const signature1 = signTransaction(walletClient, {
    authorizationList: [],
  })
  const signature2 = signTransaction(walletClient, {
    authorizationList: [],
    type: 'eip7702',
  })

  expectTypeOf(signature1).toEqualTypeOf<
    Promise<TransactionSerializedEIP7702>
  >()
  expectTypeOf(signature2).toEqualTypeOf<
    Promise<TransactionSerializedEIP7702>
  >()
})

test('eip4844', () => {
  const signature1 = signTransaction(walletClient, {
    blobs: [],
    maxFeePerBlobGas: 0n,
    to: '0x0000000000000000000000000000000000000000',
  })
  const signature2 = signTransaction(walletClient, {
    blobs: [],
    maxFeePerBlobGas: 0n,
    to: '0x0000000000000000000000000000000000000000',
    type: 'eip4844',
  })

  expectTypeOf(signature1).toEqualTypeOf<
    Promise<TransactionSerializedEIP4844>
  >()
  expectTypeOf(signature2).toEqualTypeOf<
    Promise<TransactionSerializedEIP4844>
  >()
})

test('eip1559', () => {
  const signature1 = signTransaction(walletClient, {
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })
  const signature2 = signTransaction(walletClient, {
    type: 'eip1559',
  })

  expectTypeOf(signature1).toEqualTypeOf<
    Promise<TransactionSerializedEIP1559>
  >()
  expectTypeOf(signature2).toEqualTypeOf<
    Promise<TransactionSerializedEIP1559>
  >()

  // @ts-expect-error
  signTransaction(walletClient, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  signTransaction(walletClient, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  signTransaction(walletClient, {
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  const signature1 = signTransaction(walletClient, {
    accessList: [],
    gasPrice: 0n,
  })

  const signature2 = signTransaction(walletClient, {
    type: 'eip2930',
  })

  expectTypeOf(signature1).toEqualTypeOf<
    Promise<TransactionSerializedEIP2930>
  >()
  expectTypeOf(signature2).toEqualTypeOf<
    Promise<TransactionSerializedEIP2930>
  >()

  // @ts-expect-error
  signTransaction(walletClient, {
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  signTransaction(walletClient, {
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  signTransaction(walletClient, {
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})
