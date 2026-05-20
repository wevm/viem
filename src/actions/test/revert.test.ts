import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, http } from 'viem'

const address = '0x0000000000000000000000000000000000000205'

describe('revert', () => {
  test('behavior: reverts chain state to a snapshot', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())

    await actions.setBalance(client, { address, value: 1n })
    const id = await actions.snapshot(client)
    await actions.setBalance(client, { address, value: 2n })
    await actions.revert(client, { id })

    expect(await client.public.getBalance({ address })).toMatchInlineSnapshot(
      `1n`,
    )
  })
})
