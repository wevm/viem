import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

const address = '0x0000000000000000000000000000000000000202'
const code = '0x6001600055'

describe('setCode', () => {
  test('behavior: sets account bytecode', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())

    await actions.setCode(client, { address, bytecode: code })

    expect(await client.public.getCode({ address })).toMatchInlineSnapshot(
      `"0x6001600055"`,
    )
  })

  test('behavior: selects hardhat and ganache rpc branches', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
        },
      }),
    })

    await actions.setCode(client, { address, bytecode: code, mode: 'hardhat' })
    await actions.setCode(client, { address, bytecode: code, mode: 'ganache' })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_setCode",
          "params": [
            "0x0000000000000000000000000000000000000202",
            "0x6001600055",
          ],
        },
        {
          "method": "evm_setAccountCode",
          "params": [
            "0x0000000000000000000000000000000000000202",
            "0x6001600055",
          ],
        },
      ]
    `)
  })
})
