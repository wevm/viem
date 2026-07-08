import { Provider, Value } from 'ox'
import { expect, test } from 'vitest'
import { Client, custom, http, testActions } from 'viem'
import { mainnet } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { uid } from '../../internal/uid.js'
import { wait } from '../../internal/wait.js'
import { sendCallsSync as sendCalls } from './sendCallsSync.js'

const calls = new Map<string, `0x${string}`[]>()
const node = http(anvil.mainnet.rpcUrl.http).setup({})
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())
const erc721 = {
  abi: generated.Erc721.abi,
  address: (
    await contract.deploy(anvil.getClient(anvil.mainnet), {
      bytecode: generated.Erc721.bytecode.object,
    })
  ).address,
}

const client = Client.create({
  pollingInterval: 100,
  transport: custom(
    Provider.from({
      async request({ method, params }: any) {
        if (method === 'wallet_sendCalls') {
          const hashes: `0x${string}`[] = []
          for (const call of params[0].calls) {
            await node.request({
              method: 'eth_call',
              params: [
                {
                  ...call,
                  from: params[0].from ?? constants.accounts[0].address,
                },
              ],
            })
            hashes.push(
              await node.request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    ...call,
                    from: params[0].from ?? constants.accounts[0].address,
                  },
                ],
              }),
            )
          }
          const id = uid()
          calls.set(id, hashes)
          return id
        }
        if (method === 'wallet_getCallsStatus') {
          const hashes = calls.get(params[0])
          if (!hashes)
            return {
              atomic: false,
              chainId: '0x1',
              id: params[0],
              receipts: [],
              status: 100,
              version: '2.0.0',
            }
          const receipts = await Promise.all(
            hashes.map((hash) =>
              node.request({
                method: 'eth_getTransactionReceipt',
                params: [hash],
              }),
            ),
          )
          return {
            atomic: false,
            chainId: '0x1',
            id: params[0],
            receipts,
            status: receipts.some((x) => x === null) ? 100 : 200,
            version: '2.0.0',
          }
        }
        if (method.startsWith('eth_')) return node.request({ method, params })
        return null
      },
    }),
  ),
})

test('default', async () => {
  const [response] = await Promise.all([
    sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      timeout: 5_000,
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
        { to: constants.accounts[2].address },
        {
          data: '0xcafebabe',
          to: constants.accounts[3].address,
          value: Value.fromEther('100'),
        },
        { abi: erc721.abi, functionName: 'mint', to: erc721.address },
        { abi: erc721.abi, functionName: 'mint', to: erc721.address },
      ],
    }),
    (async () => {
      for (let i = 0; i < 5; i++) {
        await wait(100)
        await testClient.block.mine({ blocks: 1 })
      }
    })(),
  ])
  expect(response.receipts).toHaveLength(5)
})
