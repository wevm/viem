import { expectTypeOf, test } from 'vitest'
import { kzg } from '~test/src/kzg.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import type { BlobSidecar, Hex, TransactionRequest } from '../../index.js'
import type { Kzg } from '../../types/kzg.js'
import type { ByteArray } from '../../types/misc.js'
import {
  defaultParameters,
  prepareTransactionRequest,
} from './prepareTransactionRequest.js'

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({
  account: true,
})
const clientWithoutChain = anvilMainnet.getClient({
  chain: false,
})

test('default', async () => {
  const result_1 = await prepareTransactionRequest(client, {})
  expectTypeOf(result_1.account).toEqualTypeOf<undefined>()
  expectTypeOf(result_1.chain).toEqualTypeOf<typeof anvilMainnet.chain>()
  expectTypeOf(result_1.gas).toEqualTypeOf<bigint>()
  expectTypeOf(result_1.nonce).toEqualTypeOf<number>()
  expectTypeOf(result_1.type).toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702'
  >()
  if (result_1.type === 'legacy' || result_1.type === 'eip2930') {
    expectTypeOf(result_1.gasPrice).toEqualTypeOf<bigint>()
    expectTypeOf(result_1.maxFeePerGas).toEqualTypeOf<never>()
    expectTypeOf(result_1.maxPriorityFeePerGas).toEqualTypeOf<never>()
  }
  if (result_1.type === 'eip1559' || result_1.type === 'eip4844') {
    expectTypeOf(result_1.gasPrice).toEqualTypeOf<never>()
    expectTypeOf(result_1.maxFeePerGas).toEqualTypeOf<bigint>()
    expectTypeOf(result_1.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
  }

  const result_2 = await prepareTransactionRequest(clientWithAccount, {})
  expectTypeOf(result_2.account).toEqualTypeOf<{
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    type: 'json-rpc'
  }>()

  // @ts-expect-error
  await prepareTransactionRequest(clientWithoutChain, {})
})

test('opaque', async () => {
  const result_generic = await prepareTransactionRequest(
    client,
    {} as TransactionRequest,
  )

  expectTypeOf(result_generic.gas).toEqualTypeOf<bigint>()
  expectTypeOf(result_generic.nonce).toEqualTypeOf<number>()
  expectTypeOf(result_generic.type).toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702'
  >()
  if (result_generic.type === 'legacy' || result_generic.type === 'eip2930') {
    expectTypeOf(result_generic.gasPrice).toEqualTypeOf<bigint>()
    expectTypeOf(result_generic.maxFeePerGas).toEqualTypeOf<never>()
    expectTypeOf(result_generic.maxPriorityFeePerGas).toEqualTypeOf<never>()
  }
  if (result_generic.type === 'eip1559' || result_generic.type === 'eip4844') {
    expectTypeOf(result_generic.gasPrice).toEqualTypeOf<never>()
    expectTypeOf(result_generic.maxFeePerGas).toEqualTypeOf<bigint>()
    expectTypeOf(result_generic.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
  }
})

test('args: type', async () => {
  const result_legacy = await prepareTransactionRequest(client, {
    type: 'legacy',
  })
  expectTypeOf(result_legacy.type).toEqualTypeOf<'legacy'>()
  expectTypeOf(result_legacy.gasPrice).toEqualTypeOf<bigint>()
  expectTypeOf(result_legacy.maxFeePerGas).toEqualTypeOf<never>()
  expectTypeOf(result_legacy.maxPriorityFeePerGas).toEqualTypeOf<never>()

  const result_eip2930 = await prepareTransactionRequest(client, {
    type: 'eip2930',
  })
  expectTypeOf(result_eip2930.type).toEqualTypeOf<'eip2930'>()
  expectTypeOf(result_eip2930.gasPrice).toEqualTypeOf<bigint>()
  expectTypeOf(result_eip2930.maxFeePerGas).toEqualTypeOf<never>()
  expectTypeOf(result_eip2930.maxPriorityFeePerGas).toEqualTypeOf<never>()

  const result_eip1559 = await prepareTransactionRequest(client, {
    type: 'eip1559',
  })
  expectTypeOf(result_eip1559.type).toEqualTypeOf<'eip1559'>()
  expectTypeOf(result_eip1559.gasPrice).toEqualTypeOf<never>()
  expectTypeOf(result_eip1559.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_eip1559.maxPriorityFeePerGas).toEqualTypeOf<bigint>()

  const result_eip4844 = await prepareTransactionRequest(client, {
    blobs: ['0x'],
    kzg,
    maxFeePerBlobGas: 1n,
    to: '0x0000000000000000000000000000000000000000',
    type: 'eip4844',
  })
  expectTypeOf(result_eip4844.blobVersionedHashes).toEqualTypeOf<
    readonly Hex[]
  >()
  expectTypeOf(result_eip4844.type).toEqualTypeOf<'eip4844'>()
  expectTypeOf(result_eip4844.blobs).toEqualTypeOf<
    readonly Hex[] | readonly ByteArray[]
  >()
  expectTypeOf(result_eip4844.sidecars).toEqualTypeOf<
    readonly BlobSidecar<`0x${string}`>[] | undefined
  >()
  expectTypeOf(result_eip4844.gasPrice).toEqualTypeOf<never>()
  expectTypeOf(result_eip4844.maxFeePerBlobGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_eip4844.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_eip4844.maxPriorityFeePerGas).toEqualTypeOf<bigint>()

  const result_eip4844_2 = await prepareTransactionRequest(client, {
    blobs: ['0x'],
    kzg,
    maxFeePerBlobGas: 1n,
    to: '0x0000000000000000000000000000000000000000',
    parameters: [...defaultParameters, 'sidecars'],
    type: 'eip4844',
  })
  expectTypeOf(result_eip4844_2.blobVersionedHashes).toEqualTypeOf<
    readonly Hex[]
  >()
  expectTypeOf(result_eip4844_2.type).toEqualTypeOf<'eip4844'>()
  expectTypeOf(result_eip4844_2.blobs).toEqualTypeOf<
    readonly Hex[] | readonly ByteArray[]
  >()
  expectTypeOf(result_eip4844_2.sidecars).toEqualTypeOf<
    readonly BlobSidecar<`0x${string}`>[]
  >()
  expectTypeOf(result_eip4844_2.gasPrice).toEqualTypeOf<never>()
  expectTypeOf(result_eip4844_2.maxFeePerBlobGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_eip4844_2.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_eip4844_2.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
})

test('args: eip1559 attributes', async () => {
  const result_1 = await prepareTransactionRequest(client, {
    maxFeePerGas: 1n,
  })
  expectTypeOf(result_1.gasPrice).toEqualTypeOf<never>()
  expectTypeOf(result_1.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_1.maxPriorityFeePerGas).toEqualTypeOf<bigint>()

  const result_2 = await prepareTransactionRequest(client, {
    maxPriorityFeePerGas: 1n,
  })
  expectTypeOf(result_2.gasPrice).toEqualTypeOf<never>()
  expectTypeOf(result_2.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_2.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
})

test('args: eip4844 attributes', async () => {
  const result_1 = await prepareTransactionRequest(client, {
    blobs: ['0x'],
    kzg,
    maxFeePerBlobGas: 1n,
    to: '0x0000000000000000000000000000000000000000',
  })
  expectTypeOf(result_1.type).toEqualTypeOf<'eip4844'>()
  expectTypeOf(result_1.blobs).toEqualTypeOf<
    readonly Hex[] | readonly ByteArray[]
  >()
  expectTypeOf(result_1.kzg).toEqualTypeOf<Kzg>()
  expectTypeOf(result_1.blobVersionedHashes).toEqualTypeOf<readonly Hex[]>()
  expectTypeOf(result_1.gasPrice).toEqualTypeOf<never>()
  expectTypeOf(result_1.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_1.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_1.maxFeePerBlobGas).toEqualTypeOf<bigint>()

  const result_2 = await prepareTransactionRequest(client, {
    blobs: ['0x'],
    blobVersionedHashes: ['0x'],
    maxFeePerBlobGas: 1n,
    to: '0x0000000000000000000000000000000000000000',
  })
  expectTypeOf(result_2.type).toEqualTypeOf<'eip4844'>()
  expectTypeOf(result_2.blobs).toEqualTypeOf<
    readonly Hex[] | readonly ByteArray[]
  >()
  expectTypeOf(result_2.blobVersionedHashes).toEqualTypeOf<readonly Hex[]>()
  expectTypeOf(result_2.gasPrice).toEqualTypeOf<never>()
  expectTypeOf(result_2.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_2.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_2.maxFeePerBlobGas).toEqualTypeOf<bigint>()
})

test('args: parameters', async () => {
  const result_1 = await prepareTransactionRequest(client, {
    parameters: ['gas'],
  })
  expectTypeOf(result_1.gas).toEqualTypeOf<bigint>()
  expectTypeOf(result_1.nonce).toEqualTypeOf<number | undefined>()
  expectTypeOf(result_1.gasPrice).toEqualTypeOf<bigint | undefined>()
  expectTypeOf(result_1.maxFeePerGas).toEqualTypeOf<bigint | undefined>()
  expectTypeOf(result_1.maxPriorityFeePerGas).toEqualTypeOf<
    bigint | undefined
  >()
  expectTypeOf(result_1.type).toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702' | undefined
  >()

  const result_2 = await prepareTransactionRequest(client, {
    parameters: ['gas', 'nonce'],
  })
  expectTypeOf(result_2.gas).toEqualTypeOf<bigint>()
  expectTypeOf(result_2.nonce).toEqualTypeOf<number>()
  expectTypeOf(result_2.gasPrice).toEqualTypeOf<bigint | undefined>()
  expectTypeOf(result_2.maxFeePerGas).toEqualTypeOf<bigint | undefined>()
  expectTypeOf(result_2.maxPriorityFeePerGas).toEqualTypeOf<
    bigint | undefined
  >()
  expectTypeOf(result_2.type).toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702' | undefined
  >()

  const result_3 = await prepareTransactionRequest(client, {
    parameters: ['gas', 'nonce', 'fees'],
  })
  expectTypeOf(result_3.gas).toEqualTypeOf<bigint>()
  expectTypeOf(result_3.nonce).toEqualTypeOf<number>()
  expectTypeOf(result_3.gasPrice).toEqualTypeOf<bigint>()
  expectTypeOf(result_3.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_3.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(result_3.type).toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702' | undefined
  >()
})
