import { Hex } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Client, custom } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('create', () => {
  test('default', async () => {
    const { receipt, ...result } = await Actions.policy.createSync(client, {
      type: 'whitelist',
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "policyId": 2n,
        "type": "whitelist",
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const data = await Actions.policy.getData(client, {
      policyId: result.policyId,
    })
    expect(data).toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "whitelist",
      }
    `)
  })

  test('behavior: blacklist', async () => {
    const { receipt, ...result } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "policyId": 3n,
        "type": "blacklist",
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const data = await Actions.policy.getData(client, {
      policyId: result.policyId,
    })
    expect(data).toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "blacklist",
      }
    `)
  })

  test('behavior: with initial addresses', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      addresses: [account2.address, account3.address],
      type: 'whitelist',
    })

    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      }),
    ).toBe(true)
    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account3.address,
      }),
    ).toBe(true)
    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account.address,
      }),
    ).toBe(false)
  })

  test('behavior: explicit admin', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      admin: account2.address,
      type: 'whitelist',
    })

    expect(await Actions.policy.getData(client, { policyId }))
      .toMatchInlineSnapshot(`
      {
        "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "type": "whitelist",
      }
    `)
  })

  test('behavior: json-rpc account: call args stay out of the request', async () => {
    const hash =
      '0x083f102bb0e0aeca27ea5c442df0bb0f36d09e3f5cf99363cef8d70a17e91039'
    let request: unknown
    const client = Client.create({
      chain: tempoLocalnet,
      transport: custom({
        async request({ method, params }) {
          if (method === 'eth_chainId') return Hex.fromNumber(tempoLocalnet.id)
          if (method === 'eth_sendTransaction') {
            request = params[0]
            return hash
          }
          throw new Error(`unexpected method: ${method}`)
        },
      }),
    })
    expect(
      await Actions.policy.create(client, {
        account: tempo.accounts[0]!.address,
        admin: tempo.accounts[0]!.address,
        type: 'whitelist',
      }),
    ).toBe(hash)
    expect(request).toMatchInlineSnapshot(`
      {
        "chainId": "0x539",
        "data": "0xca5d55f6000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "input": "0xca5d55f6000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "to": "0x403c000000000000000000000000000000000000",
      }
    `)
  })

  test('estimateGas', async () => {
    const gas = await Actions.policy.create.estimateGas(client, {
      admin: account.address,
      type: 'whitelist',
    })

    expect(gas).toBeTypeOf('bigint')
    expect(gas).toBeGreaterThan(0n)
  })

  test('simulate', async () => {
    const { request, result } = await Actions.policy.create.simulate(client, {
      type: 'blacklist',
    })

    expect(result).toBeTypeOf('bigint')
    expect(request.functionName).toBe('createPolicy')
  })

  test('extractEvent: throws when missing', () => {
    expect(() =>
      Actions.policy.create.extractEvent([]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: \`PolicyCreated\` event not found.]`,
    )
  })
})
