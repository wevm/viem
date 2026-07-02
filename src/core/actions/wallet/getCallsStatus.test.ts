import * as Provider from 'ox/Provider'
import * as Value from 'ox/Value'
import { describe, expect, test } from 'vitest'
import { Client, custom, http, testActions } from 'viem'
import { mainnet } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { uid } from '../../internal/uid.js'
import { getCallsStatus } from './getCallsStatus.js'
import { sendCalls } from './sendCalls.js'

type TxHashes = `0x${string}`[]
const calls = new Map<string, TxHashes>()
const node = http(anvil.local.rpcUrl.http).setup({})
const client = anvil.getClient(anvil.local)
const testClient = client.extend(testActions())

function getClient() {
  return Client.create({
    transport: custom(
      Provider.from({
        async request({ method, params }: any) {
          if (method === 'wallet_sendCalls') {
            const hashes: TxHashes = []
            for (const call of params[0].calls)
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
            const id = uid()
            calls.set(id, hashes)
            return id
          }
          if (method === 'wallet_getCallsStatus') {
            const hashes = calls.get(params[0])
            if (!hashes) return null
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
              status: 200,
              version: '2.0.0',
            }
          }
          if (method.startsWith('eth_')) return node.request({ method, params })
          return null
        },
      }),
    ),
  })
}

test('default', async () => {
  const mock = getClient()
  const { id } = await sendCalls(mock, {
    account: constants.accounts[0].address,
    calls: [
      { to: constants.accounts[1].address, value: Value.fromEther('1') },
      { to: constants.accounts[2].address },
      {
        data: '0xcafebabe',
        to: constants.accounts[3].address,
        value: Value.fromEther('100'),
      },
    ],
    chain: mainnet,
  })
  await testClient.block.mine({ blocks: 1 })
  const { id: id_, receipts, ...rest } = await getCallsStatus(mock, { id })
  expect(id_).toBeDefined()
  expect(receipts).toHaveLength(3)
  expect(rest).toMatchInlineSnapshot(`
    {
      "atomic": false,
      "chainId": 1,
      "status": "success",
      "statusCode": 200,
      "version": "2.0.0",
    }
  `)
})

describe('behavior: eth_sendTransaction fallback', () => {
  test('default', async () => {
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
        { to: constants.accounts[2].address },
        {
          data: '0xcafebabe',
          to: constants.accounts[3].address,
          value: Value.fromEther('100'),
        },
      ],
      experimental_fallback: true,
    })
    expect(await getCallsStatus(client, response)).toMatchInlineSnapshot(`
      {
        "atomic": false,
        "chainId": 1,
        "receipts": [],
        "status": "pending",
        "statusCode": 100,
        "version": "2.0.0",
      }
    `)
    await testClient.block.mine({ blocks: 1 })
    const { receipts, ...rest } = await getCallsStatus(client, response)
    expect(receipts).toHaveLength(3)
    expect(rest).toMatchInlineSnapshot(`
      {
        "atomic": false,
        "chainId": 1,
        "status": "success",
        "statusCode": 200,
        "version": "2.0.0",
      }
    `)
  })

  test('behavior: complete failure', async () => {
    const errors = await contract.deploy(client, {
      bytecode: generated.ErrorsExample.bytecode.object,
    })
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: [
        {
          abi: generated.ErrorsExample.abi,
          to: errors.address,
          functionName: 'revertWrite',
        },
        {
          abi: generated.ErrorsExample.abi,
          to: errors.address,
          functionName: 'simpleCustomWrite',
        },
      ],
      experimental_fallback: true,
    })
    expect(await getCallsStatus(client, response)).toMatchInlineSnapshot(`
      {
        "atomic": false,
        "chainId": 1,
        "receipts": [],
        "status": "pending",
        "statusCode": 100,
        "version": "2.0.0",
      }
    `)
    await testClient.block.mine({ blocks: 2 })
    const { receipts, ...rest } = await getCallsStatus(client, response)
    expect(receipts).toHaveLength(2)
    expect(rest).toMatchInlineSnapshot(`
      {
        "atomic": false,
        "chainId": 1,
        "status": "failure",
        "statusCode": 500,
        "version": "2.0.0",
      }
    `)
  })

  test('behavior: partial failure', async () => {
    const errors = await contract.deploy(client, {
      bytecode: generated.ErrorsExample.bytecode.object,
    })
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: [
        {
          abi: generated.ErrorsExample.abi,
          to: errors.address,
          functionName: 'revertWrite',
        },
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
      ],
      experimental_fallback: true,
    })
    expect(await getCallsStatus(client, response)).toMatchInlineSnapshot(`
      {
        "atomic": false,
        "chainId": 1,
        "receipts": [],
        "status": "pending",
        "statusCode": 100,
        "version": "2.0.0",
      }
    `)
    await testClient.block.mine({ blocks: 2 })
    const { receipts, ...rest } = await getCallsStatus(client, response)
    expect(receipts).toHaveLength(2)
    expect(rest).toMatchInlineSnapshot(`
      {
        "atomic": false,
        "chainId": 1,
        "status": "failure",
        "statusCode": 600,
        "version": "2.0.0",
      }
    `)
  })

  test('behavior: partial failure (out of funds)', async () => {
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
        { to: constants.accounts[1].address, value: Value.fromEther('10000') },
      ],
      experimental_fallback: true,
      experimental_fallbackDelay: 0,
    })
    expect(await getCallsStatus(client, response)).toMatchInlineSnapshot(`
      {
        "atomic": false,
        "chainId": 1,
        "receipts": [],
        "status": "pending",
        "statusCode": 100,
        "version": "2.0.0",
      }
    `)
    await testClient.block.mine({ blocks: 2 })
    const { receipts, ...rest } = await getCallsStatus(client, response)
    expect(receipts).toHaveLength(1)
    expect(rest).toMatchInlineSnapshot(`
      {
        "atomic": false,
        "chainId": 1,
        "status": "failure",
        "statusCode": 600,
        "version": "2.0.0",
      }
    `)
  })
})
