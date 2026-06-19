import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

const { address } = accounts[0]

describe('dropTransaction', () => {
  test('drops a pending transaction', async () => {
    await client.setAutomine({ enabled: false })
    await client.setBalance({ address, value: 10_000_000_000_000_000_000n })
    await client.impersonateAccount({ address })
    const hash = await client.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: address,
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: '0x1',
        },
      ],
    })
    await client.dropTransaction({ hash })
    expect(
      await client.request({
        method: 'eth_getTransactionByHash',
        params: [hash],
      }),
    ).toBeNull()
    await client.stopImpersonatingAccount({ address })
  })
})
