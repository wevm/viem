import { expect, test } from 'vitest'
import { wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { type Chain, mainnet } from '../../chains/index.js'
import { type Client, createClient } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { custom } from '../../clients/transports/custom.js'
import { RpcRequestError } from '../../errors/request.js'
import type { Account } from '../../types/account.js'
import type {
  WalletCallReceipt,
  WalletGetCallsStatusReturnType,
} from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import { getHttpRpcClient, parseEther } from '../../utils/index.js'
import { uid } from '../../utils/uid.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import {
  type SendCallsSyncParameters,
  sendCallsSync as sendCalls,
} from './sendCallsSync.js'

const testClient = anvilMainnet.getClient()

type Uid = string
type TxHashes = Hex[]
const calls = new Map<Uid, TxHashes[]>()

async function sendCallsSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: SendCallsSyncParameters<chain, account>,
) {
  const [result] = await Promise.all([
    sendCalls(client, { ...parameters, timeout: 5_000 }),
    (async () => {
      for (const _ of parameters.calls) {
        await wait(100)
        await mine(testClient, { blocks: 1 })
      }
    })(),
  ])
  return result
}

const client = createClient({
  transport: custom({
    async request({ method, params }) {
      const rpcClient = getHttpRpcClient(anvilMainnet.rpcUrl.http)

      if (method === 'wallet_getCallsStatus') {
        const hashes = calls.get(params[0])
        if (!hashes)
          return {
            atomic: false,
            chainId: '0x1',
            id: params[0],
            status: 100,
            receipts: [],
            version: '2.0.0',
          } satisfies WalletGetCallsStatusReturnType

        const receipts = await Promise.all(
          hashes.map(async (hash) => {
            const { result, error } = await rpcClient.request({
              body: {
                method: 'eth_getTransactionReceipt',
                params: [hash],
                id: 0,
              },
            })
            if (error)
              throw new RpcRequestError({
                body: { method, params },
                error,
                url: anvilMainnet.rpcUrl.http,
              })
            if (!result) throw new Error('receipt not found')
            return {
              blockHash: result.blockHash,
              blockNumber: result.blockNumber,
              gasUsed: result.gasUsed,
              logs: result.logs,
              status: result.status,
              transactionHash: result.transactionHash,
            } satisfies WalletCallReceipt
          }),
        )
        return {
          atomic: false,
          chainId: '0x1',
          id: params[0],
          status: 200,
          receipts,
          version: '2.0.0',
        } satisfies WalletGetCallsStatusReturnType
      }

      if (method === 'wallet_sendCalls') {
        const hashes = []
        for (const call of params[0].calls) {
          const callResult = await rpcClient.request({
            body: {
              method: 'eth_call',
              params: [
                { ...call, from: params[0].from ?? accounts[0].address },
              ],
              id: 0,
            },
          })
          if (callResult.error) throw new Error(callResult.error.message)

          const { result, error } = await rpcClient.request({
            body: {
              method: 'eth_sendTransaction',
              params: [
                {
                  ...call,
                  from: params[0].from ?? accounts[0].address,
                },
              ],
              id: 0,
            },
          })
          if (error)
            throw new RpcRequestError({
              body: { method, params },
              error,
              url: anvilMainnet.rpcUrl.http,
            })
          hashes.push(result)
        }
        const uid_ = uid()
        calls.set(uid_, hashes)
        return uid_
      }

      return null
    },
  }),
})

test('default', async () => {
  const response = await sendCallsSync(client, {
    account: accounts[0].address,
    chain: mainnet,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
      },
      {
        data: '0xcafebabe',
        to: accounts[3].address,
        value: parseEther('100'),
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
    ],
  })

  expect(response.receipts).toHaveLength(5)
})
