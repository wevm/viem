import { describe, expect, test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { eip5792Actions } from './eip5792.js'

const client = createClient({
  transport: custom({
    async request({ method }) {
      if (method === 'wallet_getCapabilities')
        return {
          '0x2105': {
            paymasterService: {
              supported: true,
            },
            sessionKeys: {
              supported: true,
            },
          },
          '0x14A34': {
            paymasterService: {
              supported: true,
            },
          },
        }
      if (method === 'wallet_sendCalls') return '0x1'
      if (method === 'wallet_getCallsStatus')
        return {
          status: 'CONFIRMED',
          receipts: [
            {
              blockHash:
                '0x66a7b39a0c4635c2f30cd191d7e1fb0bd370c11dd93199f236c5bdacfc9136b3',
              blockNumber: '0x1',
              gasUsed: '0x1',
              logs: [],
              status: '0x1',
              transactionHash:
                '0x66a7b39a0c4635c2f30cd191d7e1fb0bd370c11dd93199f236c5bdacfc9136b3',
            },
          ],
        }
      return null
    },
  }),
}).extend(eip5792Actions())

test('default', async () => {
  expect(eip5792Actions()(client)).toMatchInlineSnapshot(`
    {
      "getCallsStatus": [Function],
      "getCapabilities": [Function],
      "sendCalls": [Function],
      "showCallsStatus": [Function],
      "writeContracts": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('getCapabilities', async () => {
    expect(
      await client.getCapabilities({
        account: '0x0000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      {
        "8453": {
          "paymasterService": {
            "supported": true,
          },
          "sessionKeys": {
            "supported": true,
          },
        },
        "84532": {
          "paymasterService": {
            "supported": true,
          },
        },
      }
    `)
  })

  test('getCallsStatus', async () => {
    expect(await client.getCallsStatus({ id: '0x123' })).toMatchInlineSnapshot(`
      {
        "receipts": [
          {
            "blockHash": "0x66a7b39a0c4635c2f30cd191d7e1fb0bd370c11dd93199f236c5bdacfc9136b3",
            "blockNumber": 1n,
            "gasUsed": 1n,
            "logs": [],
            "status": "success",
            "transactionHash": "0x66a7b39a0c4635c2f30cd191d7e1fb0bd370c11dd93199f236c5bdacfc9136b3",
          },
        ],
        "status": "CONFIRMED",
      }
    `)
  })

  test('sendCalls', async () => {
    expect(
      await client.sendCalls({
        account: '0x0000000000000000000000000000000000000000',
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        chain: mainnet,
      }),
    ).toMatchInlineSnapshot(`"0x1"`)
  })

  test('writeContracts', async () => {
    expect(
      await client.writeContracts({
        account: '0x0000000000000000000000000000000000000000',
        chain: mainnet,
        contracts: [
          { ...wagmiContractConfig, functionName: 'mint' },
          { ...wagmiContractConfig, functionName: 'mint' },
          { ...wagmiContractConfig, functionName: 'mint' },
        ],
      }),
    ).toMatchInlineSnapshot(`"0x1"`)
  })
})
