import { expect, test } from 'vitest'
import { getTransactionReceipt } from '../../../actions/index.js'
import { http, createClient } from '../../../index.js'
import { baseGoerli } from '../chains.js'
import { getWithdrawalMessages } from './getWithdrawalMessages.js'

const client = createClient({
  chain: baseGoerli,
  transport: http(),
})

test('default', async () => {
  const receipt = await getTransactionReceipt(client, {
    hash: '0x034c22c449b89e07c788ccbd399775c3653d62a11a988cae28e1248bc6aa2bd6',
  })

  const messages = getWithdrawalMessages(receipt)

  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "gasLimit": 21000n,
        "nonce": 1766847064778384329583297500742918515827483896875618958121606201293272548n,
        "sender": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
        "target": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
        "value": 69n,
        "withdrawalHash": "0xc3eeba4bbe8ae9ca9e0dc27c021214057b212f32ff94c2e3f1888fa26159a5d1",
      },
    ]
  `)
})
