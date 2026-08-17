import { TransactionReceipt } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Chain, Client, http, walletActions } from 'viem'

test('return type is a transaction receipt', () => {
  expectTypeOf<Actions.transaction.sendRawSync.ReturnType>().toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})

test('chain codecs: returns the receipt converter output', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { http: 'https://eth.merkle.io' },
    codecs: {
      transactionReceipt: {
        fromRpc: (
          rpc: TransactionReceipt.Rpc,
        ): TransactionReceipt.TransactionReceipt =>
          TransactionReceipt.fromRpc(rpc),
      },
    },
  })
  const decorated = Client.create({ chain, transport: http() }).extend(
    walletActions(),
  )

  const receipt = await decorated.transaction.sendRawSync({
    transaction: '0x',
  })
  expectTypeOf(receipt).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})
