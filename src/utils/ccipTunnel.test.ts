import { describe, expect, test, beforeEach, beforeAll } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { createCcipReadTunnel } from './ccipTunnel.js'
import {
  getCode,
  getEnsAddress,
  getEnsResolver,
  readContract,
} from 'viem/actions'
import {
  ccipRequest,
  decodeFunctionResult,
  encodeFunctionData,
  namehash,
  parseAbi,
  toHex,
} from 'viem'
import { packetToBytes } from './ens/packetToBytes.js'

const batchGateways = ['https://ccip-v3.ens.xyz']
const requested = new Set<string>()
const client = anvilMainnet.getClient({
  ccipRead: createCcipReadTunnel({
    batchGateways,
    ccipRequest: async (args) => {
      for (const x of args.urls) {
        requested.add(x)
      }
      return ccipRequest(args)
    },
  }),
})

const NAME = 'raffy.base.eth'
const ADDR = '0x51050ec063d393217B436747617aD1C2285Aeeee'

describe('ccipTunnel', () => {
  beforeEach(() => requested.clear())

  test('passthrough', async () => {
    const addr = await getEnsAddress(client, { name: NAME })
    expect(addr).toStrictEqual(ADDR)
    expect([...requested]).toStrictEqual(batchGateways)
  })

  test('tunnelled', async () => {
    const abi = parseAbi(['function addr(bytes32) view returns (address)'])
    const addr = decodeFunctionResult({
      abi,
      data: await readContract(client, {
        address: await getEnsResolver(client, { name: NAME }),
        abi: parseAbi(['function resolve(bytes, bytes) view returns (bytes)']),
        functionName: 'resolve',
        args: [
          toHex(packetToBytes(NAME)),
          encodeFunctionData({
            abi,
            args: [namehash(NAME)],
          }),
        ],
      }),
    })
    expect(addr).toStrictEqual(ADDR)
    expect([...requested]).toStrictEqual(batchGateways)
  })
})
