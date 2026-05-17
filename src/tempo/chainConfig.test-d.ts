import { expectTypeOf, test } from 'vitest'
import { prepareTransactionRequest } from '../actions/wallet/prepareTransactionRequest.js'
import { tempoLocalnet } from '../chains/index.js'
import { createWalletClient } from '../clients/createWalletClient.js'
import { http } from '../clients/transports/http.js'

test('prepareTransactionRequest preserves tempo transaction type', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })

  const request_action = await prepareTransactionRequest(client, {
    calls: [],
    type: 'tempo',
  })
  const request_client = await client.prepareTransactionRequest({
    calls: [],
    type: 'tempo',
  })

  expectTypeOf(request_action.type).toEqualTypeOf<'tempo'>()
  expectTypeOf(request_client.type).toEqualTypeOf<'tempo'>()
})
