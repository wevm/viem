import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getLogProof } from './getLogProof.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const proof = await getLogProof(client, {
    txHash:
      '0x1f698500b32c325f46f008eda30df9057d54619f0d92b703952c333847a21ded',
  })

  expect(proof).toMatchInlineSnapshot(`
    {
      "id": 112,
      "proof": [
        "0x3d999d6a5bacdc5c8c01ad0917c1dca03c632fc486ac623a8857804374b0d1b1",
        "0xc3d03eebfd83049991ea3d3e358b6712e7aa2e2e63dc2d4b438987cec28ac8d0",
        "0xe3697c7f33c31a9b0f0aeb8542287d0d21e8c4cf82163d0c44c7a98aa11aa111",
        "0x199cc5812543ddceeddd0fc82807646a4899444240db2c0d2f20c3cceb5f51fa",
        "0xe4733f281f18ba3ea8775dd62d2fcd84011c8c938f16ea5790fd29a03bf8db89",
        "0x1798a1fd9c8fbb818c98cff190daa7cc10b6e5ac9716b4a2649f7c2ebcef2272",
        "0x66d7c5983afe44cf15ea8cf565b34c6c31ff0cb4dd744524f7842b942d08770d",
        "0xb04e5ee349086985f74b73971ce9dfe76bbed95c84906c5dffd96504e1e5396c",
        "0xac506ecb5465659b3a927143f6d724f91d8d9c4bdb2463aee111d9aa869874db",
        "0x124b05ec272cecd7538fdafe53b6628d31188ffb6f345139aac3c3c1fd2e470f",
        "0xc3be9cbd19304d84cca3d045e06b8db3acd68c304fc9cd4cbffe6d18036cb13f",
      ],
      "root": "0x443ddd5b010069db588a5f21e9145f94a93dd8109c72cc70d79281f1c19db2c8",
    }
  `)
})

test('args: index', async () => {
  const proof = await getLogProof(client, {
    txHash:
      '0x1f698500b32c325f46f008eda30df9057d54619f0d92b703952c333847a21ded',
    index: 5,
  })

  expect(proof).toMatchInlineSnapshot(`
    {
      "id": 112,
      "proof": [
        "0x3d999d6a5bacdc5c8c01ad0917c1dca03c632fc486ac623a8857804374b0d1b1",
        "0xc3d03eebfd83049991ea3d3e358b6712e7aa2e2e63dc2d4b438987cec28ac8d0",
        "0xe3697c7f33c31a9b0f0aeb8542287d0d21e8c4cf82163d0c44c7a98aa11aa111",
        "0x199cc5812543ddceeddd0fc82807646a4899444240db2c0d2f20c3cceb5f51fa",
        "0xe4733f281f18ba3ea8775dd62d2fcd84011c8c938f16ea5790fd29a03bf8db89",
        "0x1798a1fd9c8fbb818c98cff190daa7cc10b6e5ac9716b4a2649f7c2ebcef2272",
        "0x66d7c5983afe44cf15ea8cf565b34c6c31ff0cb4dd744524f7842b942d08770d",
        "0xb04e5ee349086985f74b73971ce9dfe76bbed95c84906c5dffd96504e1e5396c",
        "0xac506ecb5465659b3a927143f6d724f91d8d9c4bdb2463aee111d9aa869874db",
        "0x124b05ec272cecd7538fdafe53b6628d31188ffb6f345139aac3c3c1fd2e470f",
        "0xc3be9cbd19304d84cca3d045e06b8db3acd68c304fc9cd4cbffe6d18036cb13f",
      ],
      "root": "0x443ddd5b010069db588a5f21e9145f94a93dd8109c72cc70d79281f1c19db2c8",
    }
  `)
})
