import type * as TransactionReceipt from 'ox/TransactionReceipt'
import { expectTypeOf, test } from 'vitest'

import { Actions, Chain, Client, http } from 'viem'

const client = Client.create({ transport: http() })

test('default: receipt resolves to a transaction receipt', async () => {
  const { receipt } = Actions.transaction.waitForReceipt(client, {
    hash: '0x',
  })
  expectTypeOf(receipt).toEqualTypeOf<
    Promise<TransactionReceipt.TransactionReceipt>
  >()
  expectTypeOf(
    await receipt,
  ).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})

test('onReceipt: receipt is typed', () => {
  const watcher = Actions.transaction.waitForReceipt(client, { hash: '0x' })
  watcher.onReceipt((receipt) => {
    expectTypeOf(receipt).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
  })
})

test('onReplaced: response is typed', () => {
  const watcher = Actions.transaction.waitForReceipt(client, { hash: '0x' })
  watcher.onReplaced((response) => {
    expectTypeOf(response.reason).toEqualTypeOf<
      'cancelled' | 'replaced' | 'repriced'
    >()
    expectTypeOf(
      response.transactionReceipt,
    ).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
  })
})

test('onError: error is typed; off returns void', () => {
  const watcher = Actions.transaction.waitForReceipt(client, { hash: '0x' })
  watcher.onError((error) => {
    expectTypeOf(error).toEqualTypeOf<Error>()
  })
  expectTypeOf(watcher.off()).toEqualTypeOf<void>()
})

test('chain schema: receipt type reflects the chain codec', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const { receipt } = Actions.transaction.waitForReceipt(schemaClient, {
    hash: '0x',
  })
  expectTypeOf(await receipt).toEqualTypeOf<
    Chain.ExtractTransactionReceipt<typeof chain>
  >()
})
