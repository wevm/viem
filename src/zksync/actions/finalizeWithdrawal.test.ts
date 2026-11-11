import { createClient, http } from 'viem'
import { expect, test } from 'vitest'

import { anvilMainnet, anvilZksync } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { createRpcProxy } from '~test/utils.js'
import { mockRequestReturnData } from '~test/zksync.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { type EIP1193RequestFn, publicActions } from '../../index.js'
import { publicActionsL2 } from '../../zksync/decorators/publicL2.js'
import { finalizeWithdrawal } from './finalizeWithdrawal.js'

const request = (async ({ method, params }) => {
  if (method === 'eth_sendTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_getTransactionCount') return 1n
  if (method === 'eth_gasPrice') return 150_000_000n
  if (method === 'eth_getBlockByNumber') return anvilMainnet.forkBlockNumber
  if (method === 'eth_chainId') return anvilMainnet.chain.id
  return anvilMainnet.getClient().request({ method, params } as any)
}) as EIP1193RequestFn

const baseClient = anvilMainnet.getClient({ batch: { multicall: false } })
baseClient.request = request
const client = baseClient.extend(publicActions)

const baseClientWithAccount = anvilMainnet.getClient({
  batch: { multicall: false },
  account: true,
})
baseClientWithAccount.request = request
const clientWithAccount = baseClientWithAccount.extend(publicActions)

const baseClientL2 = anvilZksync.getClient()
baseClientL2.request = (async ({ method, params }) => {
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_estimateGas') return 158774n
  return (
    (await mockRequestReturnData(method)) ??
    (await anvilZksync.getClient().request({ method, params } as any))
  )
}) as EIP1193RequestFn
const clientL2 = baseClientL2.extend(publicActionsL2())

test.skip('default', async () => {
  expect(
    await finalizeWithdrawal(client, {
      account: privateKeyToAccount(accounts[0].privateKey),
      client: clientL2,
      hash: '0x08ac22b6d5d048ae8a486aa41a058bb01d82bdca6489760414aa15f61f27b943',
    }),
  ).toBeDefined()
})

test('default: account hoisting', async () => {
  expect(
    await finalizeWithdrawal(clientWithAccount, {
      client: clientL2,
      hash: '0x08ac22b6d5d048ae8a486aa41a058bb01d82bdca6489760414aa15f61f27b943',
    }),
  ).toBeDefined()
})

test('behavior: account null', async () => {
  const requests: unknown[] = []
  const url = await createRpcProxy(
    anvilMainnet.rpcUrl.http,
    ({ method, params }) => {
      if (method === 'eth_sendTransaction') requests.push(params)
      return undefined
    },
  )
  const client = createClient({
    account: accounts[0].address,
    chain: anvilMainnet.chain,
    transport: http(url),
  })

  await finalizeWithdrawal(client, {
    account: null,
    client: clientL2,
    hash: '0x08ac22b6d5d048ae8a486aa41a058bb01d82bdca6489760414aa15f61f27b943',
  })

  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "data": "0x74beea820000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000014400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000070000000000000000000000000000000000000000000000000000000000000800a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000386c0960f936615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000000000000000000000000000000000001a13b86000000000000000000000000000000000000000000000000000000000000000000000000000000000b3d999d6a5bacdc5c8c01ad0917c1dca03c632fc486ac623a8857804374b0d1b1c3d03eebfd83049991ea3d3e358b6712e7aa2e2e63dc2d4b438987cec28ac8d0e3697c7f33c31a9b0f0aeb8542287d0d21e8c4cf82163d0c44c7a98aa11aa111199cc5812543ddceeddd0fc82807646a4899444240db2c0d2f20c3cceb5f51fae4733f281f18ba3ea8775dd62d2fcd84011c8c938f16ea5790fd29a03bf8db891798a1fd9c8fbb818c98cff190daa7cc10b6e5ac9716b4a2649f7c2ebcef227266d7c5983afe44cf15ea8cf565b34c6c31ff0cb4dd744524f7842b942d08770db04e5ee349086985f74b73971ce9dfe76bbed95c84906c5dffd96504e1e5396cac506ecb5465659b3a927143f6d724f91d8d9c4bdb2463aee111d9aa869874db124b05ec272cecd7538fdafe53b6628d31188ffb6f345139aac3c3c1fd2e470fc3be9cbd19304d84cca3d045e06b8db3acd68c304fc9cd4cbffe6d18036cb13f",
          "to": "0xFb2fdA7D9377F98a6cbD7A61C9f69575c8E947b6",
        },
      ],
    ]
  `)
})
